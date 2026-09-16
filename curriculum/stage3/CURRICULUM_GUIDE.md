# Mechatronics Engineering Curriculum — Stage 3 (المرحلة الثالثة)

**Mechatronics Engineering Department — College of Engineering — University of Basrah**  
_Academic Program Specification & Standard Textbook Reference Guide_

---

## Overview

Stage 3 is the core mechatronics specialization stage: modern control engineering, mechanical vibrations, fluid power systems, power electronics, digital signal processing, industrial automation and PLCs, sensors and instrumentation, and heat transfer.

---

## Semester 5 (الفصل الخامس)

### 1. MCT311 — Linear Algebra (الجبر الخطي)

- **Status**: Mandatory Department Core | **Units**: 2 | **Hours**: 2 Theory + 1 Tutorial
- **Course Description**:
  Matrices and systems of linear equations: Gaussian elimination, Gauss-Jordan, LU decomposition. Determinants and matrix inverses. Vector spaces and subspaces: linear independence, span, basis, dimension. Linear transformations and kernel/range. Inner product spaces, orthogonality, Gram-Schmidt orthogonalization process. Eigenvalues and eigenvectors, characteristic polynomial, eigenspaces. Diagonalization of symmetric matrices. Singular Value Decomposition (SVD), pseudo-inverse. Applications in state-space control, robotics transformation matrices, and principal component analysis.
- **Canonical Textbooks**:
  1. _Linear Algebra and Its Applications_ (5th or 6th Edition) — David C. Lay, Steven R. Lay, Judi J. McDonald (Pearson).
  2. _Introduction to Linear Algebra_ (5th/6th Edition) — Gilbert Strang (Wellesley-Cambridge Press).
- **Reference Scope**: `BIBLIOGRAPHIC_ONLY` / `OPEN_ACADEMIC_EQUIVALENT`

---

### 2. MCT312 — Mechanical Vibrations (الاهتزازات الميكانيكية)

- **Status**: Mandatory Department Core | **Units**: 3 | **Hours**: 2 Theory + 2 Lab + 1 Tutorial
- **Course Description**:
  Fundamentals of vibration: simple harmonic motion, degrees of freedom, harmonic analysis. Single-degree-of-freedom (SDOF) systems: undamped free vibration, equivalent stiffness, natural frequency. Damped free vibration: viscous damping, critical damping, damping ratio, logarithmic decrement, Coulomb and structural damping. Harmonically excited vibration: steady-state response, frequency response function, magnification factor, phase angle. Base excitation, rotating unbalance, vibration isolation and transmissibility. Vibration measuring instruments (accelerometers, vibrometers). Two-degree-of-freedom (2-DOF) systems: equations of motion, natural frequencies, normal modes, coordinate coupling, dynamic vibration absorbers. Multi-degree-of-freedom (MDOF) systems intro.
- **Canonical Textbooks**:
  1. _Mechanical Vibrations_ (6th Edition) — Singiresu S. Rao (Pearson).
  2. _Theory of Vibration with Applications_ (5th Edition) — William T. Thomson, Marie Dillon Dahleh (Pearson).
- **Reference Scope**: `BIBLIOGRAPHIC_ONLY` / `OPEN_ACADEMIC_EQUIVALENT`

---

### 3. MCT313 — Fluid Mechanics and Systems (ميكانيك ومنظومات الموائع)

- **Status**: Mandatory Department Core | **Units**: 3 | **Hours**: 2 Theory + 2 Lab + 1 Tutorial
- **Course Description**:
  Fluid statics: pressure distribution, manometers, hydrostatic forces on submerged plane and curved surfaces, buoyancy and stability. Fluid dynamics: Eulerian and Lagrangian descriptions, streamlines, continuity equation. Bernoulli's equation and energy equation with pump/turbine work and head loss. Momentum equation and applications. Viscous flow in pipes: laminar and turbulent flow, Reynolds number, entrance region, Darcy-Weisbach equation, friction factor (Moody chart), minor losses in fittings and valves. Fluid power systems: hydraulic fluids, reservoirs, filters. Positive displacement pumps (gear, vane, piston), hydraulic cylinders and rotary motors. Control valves: pressure relief valves, directional control valves (DCVs), flow control valves. Basic hydraulic and pneumatic circuit design (sequencing, speed control, regeneration). Electro-pneumatic control basics.
- **Canonical Textbooks**:
  1. _Fluid Mechanics_ (9th Edition) — Frank M. White, Henry Xue (McGraw-Hill).
  2. _Fluid Power with Applications_ (7th Edition) — Anthony Esposito (Pearson).
- **Reference Scope**: `BIBLIOGRAPHIC_ONLY` / `OPEN_ACADEMIC_EQUIVALENT`

---

### 4. MCT314 — Control Systems 1 (أنظمة السيطرة 1)

- **Status**: Mandatory Department Core | **Units**: 3 | **Hours**: 2 Theory + 2 Lab + 1 Tutorial
- **Course Description**:
  Introduction to automated control systems: open-loop vs. closed-loop feedback systems. Mathematical modeling of physical systems: mechanical (translational and rotational), electrical, electromechanical (DC motors), thermal, and fluid systems. Transfer functions and impulse response. Block diagram algebra and reduction techniques. Signal flow graphs and Mason's gain formula. Time-domain analysis: standard test signals (step, ramp, impulse). First-order system response. Second-order system response: undamped, underdamped, critically damped, overdamped behaviors, transient specifications (rise time, peak time, settling time, maximum overshoot). Steady-state error analysis and system type numbers. Stability of linear feedback systems: concept of stability, Routh-Hurwitz stability criterion. The Root Locus technique: rules for construction, finding critical gain values, analysis of transient response from pole locations.
- **Canonical Textbooks**:
  1. _Modern Control Engineering_ (5th Edition) — Katsuhiko Ogata (Pearson).
  2. _Control Systems Engineering_ (8th Edition) — Norman S. Nise (John Wiley & Sons).
- **Reference Scope**: `BIBLIOGRAPHIC_ONLY` / `OPEN_ACADEMIC_EQUIVALENT`

---

### 5. MCT315 — Computer Organization (تنظيم الحاسبة والمعمارية)

- **Status**: Mandatory Department Core | **Units**: 2 | **Hours**: 2 Theory + 2 Lab
- **Course Description**:
  Functional units of a computer, Von Neumann architecture, bus interconnections. Central Processing Unit (CPU) structure: register organization, Arithmetic Logic Unit (ALU), control unit design (hardwired and microprogrammed). Instruction set architectures (CISC vs. RISC), instruction formats, addressing modes. Assembly language programming for microprocessors (x86/8086 and ARM architecture): data transfer, arithmetic, logical, branching, and string operations. Memory system: cache memory organization and mapping, primary memory (RAM, ROM), virtual memory. Input/Output organization: programmed I/O, interrupt-driven I/O, Direct Memory Access (DMA), peripheral interface standards.
- **Canonical Textbooks**:
  1. _Computer Organization and Architecture: Designing for Performance_ (11th Edition) — William Stallings (Pearson).
  2. _Computer System Architecture_ (3rd Edition) — M. Morris Mano (Pearson).
- **Reference Scope**: `BIBLIOGRAPHIC_ONLY`

---

### 6. MCT316 — Power Electronics (إلكترونيات القدرة)

- **Status**: Mandatory Department Core | **Units**: 2 | **Hours**: 2 Theory + 2 Lab
- **Course Description**:
  Power semiconductor switching devices: power diodes, Thyristors (SCR), DIAC, TRIAC, Gate Turn-Off thyristors (GTO), Power MOSFETs, Insulated Gate Bipolar Transistors (IGBT). Switching characteristics, ratings, and snubber protection circuits. Controlled rectifiers (AC to DC converters): single-phase and three-phase half-wave and full-wave controlled converters with resistive and inductive loads, firing angle control. DC-DC converters (choppers): step-down (Buck), step-up (Boost), and Buck-Boost converters, continuous and discontinuous conduction modes. Inverters (DC to AC converters): single-phase and three-phase voltage source inverters (VSI), Pulse Width Modulation (PWM) techniques (Sinusoidal PWM, Space Vector PWM). Applications in mechatronic motor drives and power management.
- **Canonical Textbooks**:
  1. _Power Electronics: Circuits, Devices, and Applications_ (4th Edition) — Muhammad H. Rashid (Pearson).
  2. _Power Electronics: Converters, Applications, and Design_ (3rd Edition) — Ned Mohan, Tore M. Undeland, William P. Robbins (Wiley).
- **Reference Scope**: `BIBLIOGRAPHIC_ONLY` / `OPEN_ACADEMIC_EQUIVALENT`

---

### 7. MCT317 — Heat Transfer (انتقال الحرارة)

- **Status**: Mandatory Department Core | **Units**: 2 | **Hours**: 2 Theory + 1 Tutorial
- **Course Description**:
  Basic modes of heat transfer: conduction, convection, radiation. Conduction: Fourier's law, thermal conductivity, general heat conduction equation in Cartesian, cylindrical, and spherical coordinates. Steady 1D conduction in plane walls, cylinders, and spheres; thermal contact resistance and composite structures. Heat transfer from extended surfaces (fins) and fin efficiency. Convection: Newton's law of cooling, boundary layer concepts, forced convection over flat plates and inside tubes, empirical correlations for Nusselt number. Natural (free) convection. Thermal radiation: Stefan-Boltzmann law, blackbody and gray surface radiation, emissivity, view factors, radiation exchange between surfaces. Heat exchangers: parallel, counter-flow, shell-and-tube, Log Mean Temperature Difference (LMTD) and NTU methods. Thermal management of electronic enclosures, heat sinks, and mechatronic drive systems.
- **Canonical Textbooks**:
  1. _Fundamentals of Heat and Mass Transfer_ (8th Edition) — Theodore L. Bergman, Adrienne S. Lavine, Frank P. Incropera, David P. DeWitt (Wiley).
  2. _Heat and Mass Transfer: Fundamentals and Applications_ (6th Edition) — Yunus A. Cengel, Afshin J. Ghajar (McGraw-Hill).
- **Reference Scope**: `BIBLIOGRAPHIC_ONLY` / `OPEN_ACADEMIC_EQUIVALENT`

---

## Semester 6 (الفصل السادس)

### 8. MCT321 — Numerical Analysis and Statistics (التحليلات العددية والإحصاء)

- **Status**: Mandatory Department Core | **Units**: 3 | **Hours**: 3 Theory + 1 Tutorial
- **Course Description**:
  Error analysis, round-off, and truncation errors. Roots of non-linear equations: Bisection, False Position, Fixed-Point iteration, Newton-Raphson, and Secant methods. Numerical linear algebra: Gauss elimination with partial pivoting, Gauss-Seidel iteration, convergence criteria. Interpolation: Lagrange polynomials, Newton's divided-difference interpolating polynomials. Curve fitting: linear regression, polynomial regression, least-squares criteria. Numerical differentiation: forward, backward, central differences. Numerical integration: Trapezoidal rule, Simpson's 1/3 and 3/8 rules, Gauss quadrature. Numerical solution of initial-value ODEs: Euler's method, Heun's method, Runge-Kutta 4th-order (RK4). Applied probability and engineering statistics: discrete and continuous random variables, normal distribution, hypothesis testing, confidence intervals.
- **Canonical Textbooks**:
  1. _Numerical Methods for Engineers_ (8th Edition) — Steven C. Chapra, Raymond P. Canale (McGraw-Hill).
  2. _Applied Statistics and Probability for Engineers_ (7th Edition) — Douglas C. Montgomery, George C. Runger (Wiley).
- **Reference Scope**: `BIBLIOGRAPHIC_ONLY`

---

### 9. MCT322 — Engineering Economy (الاقتصاد الهندسي)

- **Status**: Mandatory Department Core | **Units**: 2 | **Hours**: 2 Theory
- **Course Description**:
  Role of engineering economics in decision making. Time value of money, simple interest, compound interest, nominal and effective interest rates. Cash flow diagrams, equivalence calculations. Single payment, uniform series, and gradient factors. Evaluation of single alternatives: Present Worth (PW), Annual Worth (AW), Future Worth (FW). Comparing multiple alternatives, capitalized cost. Internal Rate of Return (IRR) and Incremental Rate of Return analysis. Benefit-Cost ratio (B/C) analysis. Depreciation methods (straight line, declining balance, MACRS). Income taxes and after-tax cash flow analysis. Break-even analysis, sensitivity analysis, economic replacement studies for engineering systems.
- **Canonical Textbooks**:
  1. _Engineering Economy_ (8th Edition) — Leland Blank, Anthony Tarquin (McGraw-Hill).
  2. _Basics of Engineering Economy_ (2nd Edition) — Leland Blank, Anthony Tarquin (McGraw-Hill).
- **Reference Scope**: `BIBLIOGRAPHIC_ONLY`

---

### 10. MCT323 — Sensors and Instrumentation (المتحسسات والآلات الدقيقة)

- **Status**: Mandatory Department Core | **Units**: 3 | **Hours**: 2 Theory + 2 Lab + 1 Tutorial
- **Course Description**:
  Generalized measurement system: sensor, signal conditioning, display/storage. Performance characteristics: static (accuracy, precision, sensitivity, linearity, resolution, hysteresis, repeatability) and dynamic (zero-order, first-order, second-order responses). Motion and position sensors: potentiometers, Linear Variable Differential Transformers (LVDT), optical encoders (incremental and absolute), resolvers, Hall-effect sensors. Strain and force sensors: electrical resistance strain gauges, Wheatstone bridge circuits, load cells, piezoelectric sensors. Temperature measurement: thermocouples, Resistance Temperature Detectors (RTD), thermistors, semiconductor sensors. Optical and proximity sensors: infrared (IR), ultrasonic, capacitive, inductive proximity sensors. Signal conditioning: instrumentation amplifiers, operational filter circuits, analog-to-digital converters (ADC), digital-to-analog converters (DAC), noise reduction, shielding and grounding. Data Acquisition (DAQ) systems and virtual instrumentation (LabVIEW / Python).
- **Canonical Textbooks**:
  1. _Introduction to Mechatronics and Measurement Systems_ (5th Edition) — David G. Alciatore (McGraw-Hill).
  2. _Sensors and Actuators: Control System Instrumentation_ — Clarence W. de Silva (CRC Press).
- **Reference Scope**: `BIBLIOGRAPHIC_ONLY` / `OPEN_ACADEMIC_EQUIVALENT`

---

### 11. MCT324 — Control Systems 2 (أنظمة السيطرة 2)

- **Status**: Mandatory Department Core | **Units**: 3 | **Hours**: 2 Theory + 2 Lab + 1 Tutorial
- **Course Description**:
  Frequency response analysis of linear systems: polar plots, Bode plots (gain margin, phase margin, relative stability), Nyquist stability criterion. Design of feedback compensators in frequency domain: Lead, Lag, and Lead-Lag compensators. PID controllers: proportional, integral, and derivative actions, Ziegler-Nichols tuning rules, practical derivative filters, anti-windup schemes. Modern control theory: state-space representation of dynamic systems, state transition matrix, state equation solution. Relationship between transfer functions and state-space models. Controllability and observability (Kalman criteria). Full state feedback controller design via pole placement (Ackermann's formula). State observers (Luenberger observer design). Introduction to digital control systems: z-transform, pulse transfer functions, discretization of continuous controllers.
- **Canonical Textbooks**:
  1. _Modern Control Engineering_ (5th Edition) — Katsuhiko Ogata (Pearson).
  2. _Control Systems Engineering_ (8th Edition) — Norman S. Nise (Wiley).
- **Reference Scope**: `BIBLIOGRAPHIC_ONLY` / `OPEN_ACADEMIC_EQUIVALENT`

---

### 12. MCT325 — Automation Systems (منظومات الأتمتة والتحكم الصناعي)

- **Status**: Mandatory Department Core | **Units**: 3 | **Hours**: 2 Theory + 2 Lab
- **Course Description**:
  Fundamentals of industrial automation, industrial control hierarchy. Programmable Logic Controllers (PLCs): architecture, CPU, memory, discrete and analog I/O modules, power supply, scan cycle. IEC 61131-3 programming languages with primary focus on Ladder Diagram (LD) and Function Block Diagram (FBD). Basic logic operations, latches, timers (TON, TOF, TP), counters (CTU, CTD). Data handling, math instructions, comparison functions. Sequencer and state-machine design for industrial automation. Hardware interfacing: pushbuttons, limit switches, proximity sensors, relays, contactors, solenoid valves. Supervisory Control and Data Acquisition (SCADA) systems, Human-Machine Interface (HMI) screen design, alarm management, historical trends. Industrial safety systems, Emergency Stop (E-Stop) standards, and fail-safe automation principles.
- **Canonical Textbooks**:
  1. _Programmable Logic Controllers_ (5th Edition) — Frank D. Petruzella (McGraw-Hill).
  2. _Automating Manufacturing Systems with PLCs_ — Hugh Jack.
- **Reference Scope**: `BIBLIOGRAPHIC_ONLY` / `OPEN_ACADEMIC_EQUIVALENT`

---

### 13. MCT326 — Digital Signal Processing (معالجة الإشارة الرقمية)

- **Status**: Mandatory Department Core | **Units**: 3 | **Hours**: 2 Theory + 2 Lab + 1 Tutorial
- **Course Description**:
  Signals and systems classification: continuous-time vs. discrete-time signals. Sampling theorem, Nyquist rate, aliasing, anti-aliasing filters. Discrete-Time Linear Time-Invariant (LTI) systems, impulse response, discrete convolution. Difference equations and block diagram representation. The z-transform: region of convergence (ROC), properties, inverse z-transform, transfer function and system stability. Frequency analysis of discrete-time signals: Discrete-Time Fourier Transform (DTFT), Discrete Fourier Transform (DFT), Fast Fourier Transform (FFT) algorithms (Decimation-in-Time and Decimation-in-Frequency). Digital filter design: Finite Impulse Response (FIR) filters (windowing methods: Rectangular, Hamming, Hanning, Blackman), Infinite Impulse Response (IIR) filters (Bilinear transformation, Butterworth and Chebyshev approximations). Applications in biomedical, vibrational, and mechatronic sensor filtering.
- **Canonical Textbooks**:
  1. _Digital Signal Processing: Principles, Algorithms, and Applications_ (5th Edition) — John G. Proakis, Dimitris G. Manolakis (Pearson).
  2. _Discrete-Time Signal Processing_ (3rd Edition) — Alan V. Oppenheim, Ronald W. Schafer (Pearson).
- **Reference Scope**: `BIBLIOGRAPHIC_ONLY` / `OPEN_ACADEMIC_EQUIVALENT`

---

### 14. MCT327 — Renewable Energy (الطاقة المتجددة)

- **Status**: Department Elective / Core | **Units**: 2 | **Hours**: 2 Theory
- **Course Description**:
  Global energy landscape, environmental impact of fossil fuels. Solar photovoltaic (PV) systems: solar radiation, cell physics, P-V and I-V characteristics, Maximum Power Point Tracking (MPPT) algorithms (Perturb & Observe, Incremental Conductance), grid-tied and standalone inverters. Solar thermal systems. Wind energy systems: aerodynamics of wind turbines, Betz limit, pitch control, stall control, generator architectures (DFIG, PMSG). Energy storage technologies: lithium-ion battery chemistry, Battery Management Systems (BMS), supercapacitors, hydrogen fuel cells. Integration of renewable energy in microgrids and autonomous mechatronics/robotic platforms.
- **Canonical Textbooks**:
  1. _Renewable and Efficient Electric Power Systems_ (2nd Edition) — Gilbert M. Masters (Wiley).
- **Reference Scope**: `BIBLIOGRAPHIC_ONLY`
