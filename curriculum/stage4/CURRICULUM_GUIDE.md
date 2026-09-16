# Mechatronics Engineering Curriculum — Stage 4 (المرحلة الرابعة)

**Mechatronics Engineering Department — College of Engineering — University of Basrah**  
_Academic Program Specification & Standard Textbook Reference Guide_

---

## Overview

Stage 4 is the graduation and advanced engineering design stage: embedded microcontrollers, mechanical machine design, artificial intelligence, unmanned aerial vehicles (Drones), industrial communication networks, biomechatronics, robotics kinematics and dynamics, computer vision, and the capstone graduation project.

---

## Semester 7 (الفصل السابع)

### 1. MCT411 — Embedded Systems (الأنظمة المضمنة والمعالجات الدقيقة)

- **Status**: Mandatory Department Core | **Units**: 3 | **Hours**: 2 Theory + 2 Lab + 1 Tutorial
- **Course Description**:
  Embedded system architectures: microcontrollers vs. microprocessors. Focus on 32-bit ARM Cortex-M architecture (STM32 / TI MSP432) and 8-bit AVR/PIC. Embedded C programming, memory-mapped I/O, register-level manipulation, hardware abstraction layers (HAL). General Purpose Input/Output (GPIO) configuration, pull-up/pull-down resistors, debouncing. Hardware timers, counter modes, Input Capture, Output Compare, Pulse Width Modulation (PWM) generation for motor drivers. Interrupt handling: nested vectored interrupt controller (NVIC), ISR design, latency, prioritization. Analog-to-Digital Converters (ADC) and DMA data streaming. Serial communication peripherals: UART, SPI, and I2C buses, timing diagrams, protocol implementation. Real-Time Operating Systems (RTOS): tasks, scheduler, context switching, semaphores, mutexes, message queues (FreeRTOS). Low-power modes and watchdog timers.
- **Canonical Textbooks**:
  1. _The Definitive Guide to ARM Cortex-M3 and Cortex-M4 Processors_ (3rd Edition) — Joseph Yiu (Newnes / Elsevier).
  2. _Embedded Systems: Real-Time Interfacing to ARM Cortex-M Microcontrollers_ — Jonathan W. Valvano.
- **Reference Scope**: `BIBLIOGRAPHIC_ONLY` / `OPEN_ACADEMIC_EQUIVALENT`

---

### 2. MCT412 — Mechanical Design 1 (التصميم الميكانيكي 1)

- **Status**: Mandatory Department Core | **Units**: 3 | **Hours**: 2 Theory + 2 Lab + 1 Tutorial
- **Course Description**:
  Mechanical engineering design methodology, design considerations, safety factors, codes and standards. Materials selection in design. Static failure theories: Maximum Normal Stress (MNS), Maximum Shear Stress (Tresca), Distortion Energy (von Mises), Mohr's failure criteria for ductile and brittle materials. Fatigue failure theories: stress concentration factors, S-N diagrams, endurance limit modification factors, completely reversed and fluctuating stresses, Goodman, Gerber, and ASME elliptic fatigue failure criteria. Design of power screws and threaded fasteners (bolts, preloading, joint stiffness, bolted joint fatigue). Welded, brazed, and bonded joints. Design of mechanical springs: helical compression, extension, and torsion springs, fatigue loading of springs. Design of power transmission shafts, keys, splines, and couplings.
- **Canonical Textbooks**:
  1. _Shigley's Mechanical Engineering Design_ (11th or 12th Edition) — Richard G. Budynas, J. Keith Nisbett (McGraw-Hill).
  2. _Fundamentals of Machine Component Design_ (7th Edition) — Robert C. Juvinall, Kurt M. Marshek (Wiley).
- **Reference Scope**: `BIBLIOGRAPHIC_ONLY` / `OPEN_ACADEMIC_EQUIVALENT`

---

### 3. MCT413 — Artificial Intelligence (الذكاء الاصطناعي)

- **Status**: Mandatory Department Core | **Units**: 2 | **Hours**: 2 Theory + 2 Lab
- **Course Description**:
  Foundations of AI and intelligent agents in mechatronics. Problem solving by searching: uninformed search (BFS, DFS, Uniform Cost), informed/heuristic search (Greedy Best-First, A* search), admissibility and consistency. Adversarial search and Minimax. Knowledge representation and reasoning: propositional and first-order logic. Fuzzy Logic Systems: fuzzy sets, membership functions, linguistic variables, fuzzy rules, fuzzy inference engines (Mamdani and Sugeno), defuzzification, fuzzy PID controllers in mechatronics. Machine Learning fundamentals: supervised learning (linear regression, logistic regression, decision trees, support vector machines), unsupervised learning (K-means clustering, PCA). Artificial Neural Networks (ANN): perceptron, multi-layer perceptron (MLP), backpropagation algorithm, activation functions. Deep learning intro (CNNs for visual inspection). Reinforcement learning basics (Q-learning) for robotic navigation.
- **Canonical Textbooks**:
  1. _Artificial Intelligence: A Modern Approach_ (4th Edition) — Stuart Russell, Peter Norvig (Pearson).
  2. _Fuzzy Logic with Engineering Applications_ (4th Edition) — Timothy J. Ross (Wiley).
- **Reference Scope**: `BIBLIOGRAPHIC_ONLY` / `OPEN_ACADEMIC_EQUIVALENT`

---

### 4. P4MCT — Engineering Project (المشروع الهندسي - التخرج)

- **Status**: Mandatory Department Core | **Units**: 2 | **Hours**: 2 Practical / Lab
- **Special Invariant Notice**: `P4MCT = IDENTITY_ONLY`. Identity entity; open-ended capstone project with no fabricated standardized weekly lecture curriculum.
- **Course Description**:
  Senior capstone graduation project spanning Semesters 7 & 8. Problem identification, engineering requirements specification, literature survey, conceptual system design, electromechanical modeling, sensor/actuator sizing, embedded hardware design, software development, prototype fabrication, experimental validation, comprehensive engineering thesis preparation, and formal defense before department faculty jury.
- **Reference Scope**: `IDENTITY_ONLY`

---

### 5. MCT414 — Project Management (إدارة المشاريع الهندسية)

- **Status**: Mandatory Department Core | **Units**: 2 | **Hours**: 2 Theory
- **Course Description**:
  Project lifecycle, project organization structures. Project initiation, scope definition, Work Breakdown Structure (WBS). Project planning and scheduling: Gantt charts, network diagrams (AOA and AON). Critical Path Method (CPM), Program Evaluation and Review Technique (PERT), slack/float calculation, project crashing and time-cost trade-offs. Resource management: resource leveling, resource allocation. Project cost estimation, budgeting, Earned Value Management (EVM: PV, EV, AC, CV, SV, CPI, SPI). Risk management: risk identification, qualitative and quantitative risk analysis, risk mitigation strategies. Quality management, procurement, contracts, and project closing procedures.
- **Canonical Textbooks**:
  1. _Project Management: A Systems Approach to Planning, Scheduling, and Controlling_ (13th Edition) — Harold Kerzner (Wiley).
  2. _A Guide to the Project Management Body of Knowledge (PMBOK Guide)_ (7th Edition) — Project Management Institute (PMI).
- **Reference Scope**: `BIBLIOGRAPHIC_ONLY`

---

### 6. MCT415 — Mechatronics Systems Design – Drones (تصميم أنظمة الميكاترونكس - الطائرات المسيرة)

- **Status**: Mandatory Department Core | **Units**: 3 | **Hours**: 2 Theory + 2 Lab
- **Course Description**:
  Overview of Unmanned Aerial Vehicles (UAVs): fixed-wing, multirotor (quadcopter, hexacopter), VTOL configurations. Multirotor physics and aerodynamics: thrust generation, blade element theory, momentum theory. Equations of motion: 6-DOF rigid-body dynamics, coordinate frames (body frame, Earth NED frame), Euler angles, rotation matrices, quaternions. Propulsion systems: brushless DC (BLDC) motors, Electronic Speed Controllers (ESCs), propeller selection, lithium-polymer (LiPo) battery sizing. Avionics and flight sensor suites: Inertial Measurement Units (IMU: accelerometers, gyroscopes), magnetometers, barometers, GPS/GNSS, optical flow. Sensor fusion algorithms (Complementary filter, Extended Kalman Filter EKF). Flight control system architecture: cascaded PID controllers for attitude, altitude, and position hold; state-space LQR control. Autonomous navigation, waypoints, fail-safe modes (Return-to-Home RTH), and obstacle avoidance.
- **Canonical Textbooks**:
  1. _Small Unmanned Aircraft: Theory and Practice_ — Randal W. Beard, Timothy W. McLain (Princeton University Press).
  2. _Introduction to Multicopter Design and Control_ — Quan Quan (Springer).
- **Reference Scope**: `BIBLIOGRAPHIC_ONLY` / `OPEN_ACADEMIC_EQUIVALENT`

---

### 7. MCT416 — Industrial Communication Networks (شبكات الاتصالات الصناعية)

- **Status**: Mandatory Department Core | **Units**: 2 | **Hours**: 2 Theory + 2 Lab
- **Course Description**:
  Data communications review: OSI 7-layer model, physical layer standards (RS-232, RS-422, RS-485). Industrial network topology and requirements (determinism, real-time latency, noise immunity). Serial fieldbuses: Modbus RTU/ASCII (frame structure, function codes, master-slave architecture). Controller Area Network (CAN Bus): message frames, bit stuffing, non-destructive bitwise arbitration, error detection, CANopen protocol for automotive and robotic automation. Process fieldbuses: PROFIBUS (DP and PA), Foundation Fieldbus, DeviceNet. Industrial Ethernet: IEEE 802.3, switches vs. hubs, PROFINET, Modbus TCP/IP, EtherCAT (on-the-fly frame processing). Industrial wireless networks: WirelessHART, ISA100.11a, ZigBee, Industrial Wi-Fi. Open Platform Communications (OPC) and OPC Unified Architecture (OPC UA). Cyber-security in Industrial Control Systems (ICS/SCADA).
- **Canonical Textbooks**:
  1. _Industrial Communication Systems_ — Bogdan M. Wilamowski, J. David Irwin (CRC Press).
  2. _Industrial Ethernet on the Plant Floor_ — Robert Lounsbury (ISA).
- **Reference Scope**: `BIBLIOGRAPHIC_ONLY`

---

## Semester 8 (الفصل الثامن)

### 8. MCT421 — Biomechatronics (الميكاترونكس الأحيائي)

- **Status**: Mandatory Department Core | **Units**: 2 | **Hours**: 2 Theory
- **Course Description**:
  Introduction to biomechatronics: engineering systems that interface with human physiology. Fundamentals of human musculoskeletal biomechanics: muscle contraction models (Hill's model), joint kinematics, bone mechanics. Biosensors and physiological signal acquisition: Electromyography (EMG), Electroencephalography (EEG), Electrocardiography (ECG), bioimpedance. Signal conditioning, filtering, and feature extraction of bio-signals for intent recognition. Actuators in biomechatronics: pneumatic artificial muscles (McKibben muscles), shape memory alloys (SMA), series elastic actuators (SEA). Prosthetic limbs: upper-limb myoelectric prostheses, active lower-limb prostheses. Wearable orthotics and powered exoskeletons for rehabilitation and human augmentation. Brain-Computer Interfaces (BCI) basics, safety, biocompatibility, and ethical considerations.
- **Canonical Textbooks**:
  1. _Biomechatronics_ — Marko B. Popovic (Academic Press / Elsevier).
  2. _Wearable Robots: Biomechatronic Exoskeletons_ — José L. Pons (Wiley).
- **Reference Scope**: `BIBLIOGRAPHIC_ONLY`

---

### 9. MCT422 — Mechanical Design 2 (التصميم الميكانيكي 2)

- **Status**: Mandatory Department Core | **Units**: 3 | **Hours**: 2 Theory + 2 Lab + 1 Tutorial
- **Course Description**:
  Design and selection of rolling-element bearings (deep-groove ball, angular contact, cylindrical roller, spherical roller, tapered roller): life ratings, load ratings, dynamic/static equivalent loads, lubrication, mounting, and preloading. Hydrodynamic lubrication and journal bearing design: Petroff's equation, Raimondi-Boyd charts, minimum film thickness, temperature rise. Gear design: spur gears, AGMA bending and surface durability stress equations, geometry factors, dynamic factor, hardness ratio. Helical gears: virtual number of teeth, forces, and AGMA rating. Bevel gears (straight and spiral) and worm gearing (lead angle, efficiency, heat dissipation). Flexible mechanical elements: flat belts, V-belts, timing belts, roller chains, wire ropes. Brakes and clutches: internal expanding rim brakes, band brakes, disc brakes, cone clutches, plate clutches, energy dissipation, and friction materials.
- **Canonical Textbooks**:
  1. _Shigley's Mechanical Engineering Design_ (11th/12th Edition) — Richard G. Budynas, J. Keith Nisbett (McGraw-Hill).
  2. _Machine Design: An Integrated Approach_ (6th Edition) — Robert L. Norton (Pearson).
- **Reference Scope**: `BIBLIOGRAPHIC_ONLY` / `OPEN_ACADEMIC_EQUIVALENT`

---

### 10. MCT423 — Industrial Engineering (الهندسة الصناعية وإدارة الإنتاج)

- **Status**: Mandatory Department Core | **Units**: 2 | **Hours**: 2 Theory
- **Course Description**:
  Productivity concepts and measurement. Operations strategy, forecasting demand (time-series, moving averages, exponential smoothing). Facility location models and facility layout design (product, process, cellular layouts). Line balancing techniques. Work study and ergonomics: method study, time study, standard time calculations, workplace design principles. Inventory management: Economic Order Quantity (EOQ), economic production quantity, safety stock, reorder point, ABC inventory classification. Material Requirements Planning (MRP) and Just-in-Time (JIT) / Lean manufacturing systems. Total Quality Management (TQM), statistical process control (SPC): control charts for variables (X-bar and R charts) and attributes (p, c charts). Process capability index (Cp, Cpk), Six Sigma methodologies.
- **Canonical Textbooks**:
  1. _Operations Management_ (14th Edition) — William J. Stevenson (McGraw-Hill).
  2. _Work Systems: The Methods, Measurement, and Management of Work_ — Mikell P. Groover (Pearson).
- **Reference Scope**: `BIBLIOGRAPHIC_ONLY`

---

### 11. MCT424 — Robotic Systems (الأنظمة الروبوتية)

- **Status**: Mandatory Department Core | **Units**: 3 | **Hours**: 2 Theory + 2 Lab + 1 Tutorial
- **Course Description**:
  Introduction to robotics: manipulator configurations (Cartesian, Cylindrical, Spherical, SCARA, Articulated). Spatial descriptions and transformations: representation of position and orientation, rotation matrices, Euler angles, homogeneous transformation matrices. Forward kinematics: link parameters, Denavit-Hartenberg (DH) convention, arm matrix derivation. Inverse kinematics: analytical (geometric and algebraic) solutions, solvability, multiple solutions. Manipulator differential kinematics: velocities, angular velocities, the Manipulator Jacobian matrix, geometric vs. analytical Jacobians. Singularities (workspace and boundary singularities), dexterity, and manipulability. Statics of manipulators: Jacobian transpose in force distribution. Manipulator dynamics: Euler-Lagrange formulation, inertia matrix, Coriolis and centrifugal terms, gravity vector. Trajectory generation: joint-space vs. Cartesian-space trajectories, polynomial trajectories (cubic, quintic), linear segments with parabolic blends (LSPB). Independent joint control (PID with feedforward). Mobile robots: differential drive kinematics, non-holonomic constraints, wheel configurations.
- **Canonical Textbooks**:
  1. _Introduction to Robotics: Mechanics and Control_ (4th Edition) — John J. Craig (Pearson).
  2. _Robot Modeling and Control_ (2nd Edition) — Mark W. Spong, Seth Hutchinson, M. Vidyasagar (Wiley).
- **Reference Scope**: `BIBLIOGRAPHIC_ONLY` / `OPEN_ACADEMIC_EQUIVALENT`

---

### 12. MCT425 — Professional Ethics (أخلاقيات المهنة الهندسية)

- **Status**: University Requirement | **Units**: 1 | **Hours**: 1 Theory
- **Course Description**:
  المسؤولية الأخلاقية والمهنية للمهندس، مواثيق الشرف الأخلاقي الهندسية العالمية والمحلية (نقابة المهندسين العراقية، IEEE، ASME). السلامة المهنية، تقييم المخاطر، حماية البيئة والتنمية المستدامة، حقوق الملكية الفكرية وبراءات الاختراع، مكافحة الفساد في المشاريع الهندسية، وقضايا المسؤولية القانونية والأخلاقية لتطبيقات الذكاء الاصطناعي والروبوتات ذاتية القيادة.
- **Canonical Textbooks**:
  1. _Engineering Ethics: Concepts and Cases_ (6th Edition) — Charles E. Harris, Jr. et al. (Cengage).
  2. _Engineering Ethics_ (4th Edition) — Charles B. Fleddermann (Pearson).
- **Reference Scope**: `BIBLIOGRAPHIC_ONLY`

---

### 13. MCT426 — Image Processing and Computer Vision (معالجة الصور والرؤية الحاسوبية)

- **Status**: Mandatory Department Core | **Units**: 3 | **Hours**: 2 Theory + 2 Lab
- **Course Description**:
  Digital image fundamentals: image acquisition, pinhole camera model, sampling, quantization, color models (RGB, HSV, Grayscale). Spatial domain image enhancement: point operations, intensity transformations (contrast stretching, log transformation, histogram equalization), spatial filtering (smoothing filters, median filter, Gaussian blur). Edge detection: gradient operators (Sobel, Prewitt), Laplacian, Laplacian of Gaussian (LoG), Canny edge detector. Frequency domain filtering: 2D Discrete Fourier Transform (DFT), low-pass and high-pass filters. Morphological image processing: dilation, erosion, opening, closing, boundary extraction. Image segmentation: thresholding (Otsu's method), region growing, watershed segmentation. Feature extraction: contours, corners (Harris corner detector), descriptors (SIFT, ORB). Object detection and recognition: template matching, Haar cascades, deep learning-based detection (YOLO, SSD) for robotic grasping and autonomous navigation. Practical implementation using OpenCV (Python / C++).
- **Canonical Textbooks**:
  1. _Digital Image Processing_ (4th Edition) — Rafael C. Gonzalez, Richard E. Woods (Pearson).
  2. _Computer Vision: Algorithms and Applications_ (2nd Edition) — Richard Szeliski (Springer).
- **Reference Scope**: `BIBLIOGRAPHIC_ONLY` / `OPEN_ACADEMIC_EQUIVALENT`
