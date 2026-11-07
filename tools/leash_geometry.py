#!/usr/bin/env python3
"""Line, horn and force numbers for the hand leash. Run it; it asserts its own limits.

Lengths are mm, angles degrees, stiffness Nm/rad. Wrist center is the origin.
Stiffness is Formica et al. 2012 (10 people, within about 17 degrees of neutral), mean and mean + 1 SD.
Change GEOMETRY or the servo torque when real measurements come in.
"""
import math

KGFCM_TO_NM = 0.0980665
MG90S_5V_NM = (1.8 + (2.2 - 1.8) * (5.0 - 4.8) / 1.2) * KGFCM_TO_NM  # sheet: 1.8 at 4.8 V, 2.2 at 6 V
STRONGER_NM = 3.5 * KGFCM_TO_NM  # a 3.5 kgf-cm micro servo, for comparison
HORN_LIMIT_DEG = 75  # past this the horn nears straight-line lockup
LOWEST_BODY_FORCE_N = 90  # DGUV FP-430 Table 21, quasi-static: arm nerve 90 N, forearm muscle 100 N
LOWEST_BODY_PRESSURE = 180  # same table, N/cm2: arm nerve and radial bone

STIFFNESS = {  # (mean, mean + 1 SD)
    "flexion": (0.554, 0.724),
    "extension": (1.021, 1.400),
    "radial": (1.710, 2.283),
    "ulnar": (1.245, 1.693),
}


def line_length(theta_deg, guide_back, guide_out, anchor_fwd, anchor_out):
    """Straight line from the guide on the forearm to the anchor on the tilted hand."""
    t = math.radians(theta_deg)
    x = anchor_fwd * math.cos(t) - anchor_out * math.sin(t)
    y = anchor_fwd * math.sin(t) + anchor_out * math.cos(t)
    return math.hypot(x + guide_back, y - guide_out)


def run_axis(side, geometry, horn_r, slack, torque_nm, k_index=0):
    """Walk the horn out to its limit. Returns tilt reached, peak tension, weakest stall margin."""
    k = STIFFNESS[side][k_index]
    rest = line_length(0, *geometry)
    tilt = peak = 0.0
    margin = float("inf")
    for phi_tenths in range(0, HORN_LIMIT_DEG * 10 + 1):
        phi = math.radians(phi_tenths / 10)
        pulled = horn_r * math.sin(phi) - slack
        if pulled <= 0:
            continue
        while line_length(tilt + 0.05, *geometry) >= rest - pulled and tilt < 80:
            tilt += 0.05
        arm_m = (line_length(tilt, *geometry) - line_length(tilt + 0.1, *geometry)) / math.radians(0.1) / 1000
        tension = k * math.radians(tilt) / arm_m
        available = torque_nm / (horn_r / 1000 * math.cos(phi))
        peak = max(peak, tension)
        margin = min(margin, available / tension) if tension > 0 else margin
    return tilt, peak, margin


GEOMETRY = {  # guide mm behind wrist, guide mm off the axis, anchor mm ahead of wrist, anchor mm off the axis
    "crossbar": (50, 45, 60, 20),
    "no standoff": (50, 22, 60, 20),
    "edge guide": (50, 35, 60, 28),
}


def report():
    print(f"MG90S at 5 V: {MG90S_5V_NM:.3f} Nm stall (interpolated from the sheet)\n")
    rows = [
        ("Handshake pose, left/right = flexion", "flexion", "crossbar", 16, 2),
        ("Handshake pose, left/right = extension", "extension", "crossbar", 16, 2),
        ("Same with no standoff, extension", "extension", "no standoff", 16, 2),
        ("Palm down, left/right = radial", "radial", "edge guide", 16, 2),
        ("Palm down, left/right = ulnar", "ulnar", "edge guide", 16, 2),
        ("Handshake pose, up = radial, 10 mm hole", "radial", "edge guide", 10, 2),
        ("Handshake pose, down = ulnar, 10 mm hole", "ulnar", "edge guide", 10, 2),
    ]
    print(f"{'case':43} {'tilt':>5} {'N avg':>6} {'N +1SD':>7} {'margin':>7} {'+1SD':>6} {'3.5kg':>6}")
    for name, side, geo, r, slack in rows:
        g = GEOMETRY[geo]
        tilt, tension, margin = run_axis(side, g, r, slack, MG90S_5V_NM)
        _, tension_sd, margin_sd = run_axis(side, g, r, slack, MG90S_5V_NM, 1)
        _, _, margin_strong = run_axis(side, g, r, slack, STRONGER_NM, 1)
        print(f"{name:43} {tilt:5.1f} {tension:6.1f} {tension_sd:7.1f} {margin:7.2f} {margin_sd:6.2f} {margin_strong:6.2f}")

    gravity = 0.45 * 9.81 * 0.06  # hand 0.6% of a 75 kg body, center about 60 mm out (from memory)
    print(f"\nRelaxed hand weight torque: about {gravity:.2f} Nm. It works against 'up' in the handshake pose,")
    print("and against wrist lift in the palm-down pose. It is not in the table above.")
    line_area_cm2 = 0.03 * 1.0  # 0.3 mm line on 1 cm of skin
    tab_area_cm2 = 2.5 * 2.0
    print(f"20 N on bare skin through a 0.3 mm line: {20 / line_area_cm2:.0f} N/cm2. Limit table low: {LOWEST_BODY_PRESSURE}.")
    print(f"20 N through a 2.5 x 2 cm glove tab: {20 / tab_area_cm2:.0f} N/cm2.")
    stall_at_limit = MG90S_5V_NM / (16 / 1000 * math.cos(math.radians(HORN_LIMIT_DEG)))
    print(f"Most the MG90S can pull at the {HORN_LIMIT_DEG} degree horn limit, 16 mm hole: {stall_at_limit:.0f} N.")


def self_check():
    assert abs(line_length(0, 50, 20, 60, 20) - 110) < 1e-9  # flat line, 50 + 60
    assert line_length(20, 50, 45, 60, 20) < line_length(0, 50, 45, 60, 20)  # tilting toward the guide shortens it
    flex = run_axis("flexion", GEOMETRY["crossbar"], 16, 2, MG90S_5V_NM)
    ext = run_axis("extension", GEOMETRY["crossbar"], 16, 2, MG90S_5V_NM)
    assert ext[1] > flex[1]  # extension is stiffer, so it takes more line tension
    assert flex[0] < 30  # full horn travel stays inside a safe wrist angle by geometry alone
    assert run_axis("radial", GEOMETRY["edge guide"], 10, 2, MG90S_5V_NM)[0] < 18.6  # mean radial range, 2018 study
    assert ext[1] < LOWEST_BODY_FORCE_N
    print("self-check ok")


if __name__ == "__main__":
    report()
    self_check()
