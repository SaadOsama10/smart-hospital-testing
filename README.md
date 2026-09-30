# 🏥 Smart Hospital System

> A comprehensive, full-stack web application for managing hospital operations, appointments, and medical records. Built with a hybrid architecture using **Spring Boot (Java)** and **React.js**, and deployed on **AWS Cloud**.

---

## 📖 Project Overview
The **Smart Hospital System** connects patients, doctors, and administrators in a secure digital environment. It streamlines the healthcare process by allowing patients to book appointments instantly, doctors to manage prescriptions with real-time FDA drug data, and admins to oversee hospital staff.

**Key Architecture:**
* **Hybrid Frontend:** Combines **Thymeleaf (SSR)** for secure authentication pages and **React.js (SPA)** for a dynamic, responsive dashboard.
* **Secure Backend:** Powered by **Spring Boot** with **Spring Security** (Role-Based Access Control).
* **Stateful Auth:** Uses secure **HttpOnly Cookies (JSESSIONID)** instead of local storage tokens to prevent XSS attacks.

---

## 📸 Application Screenshots

### 1. Landing & Authentication
The entry point for all users. We use a hybrid approach where the landing page and login forms are Server-Side Rendered (Thymeleaf) for security and speed.

| Main Landing Page | Secure Login |
|:---:|:---:|
| [Landing Page](screenshots/main-page.png) | [Login Screen](screenshots/login.png) |

### 2. Patient Dashboard & Booking
Patients can browse departments, select specialists, and book appointments instantly.

| Patient Dashboard | Booking Interface |
|:---:|:---:|
| [Patient Dashboard](screenshots/patient-booking.png) | [Medical History](screenshots/patient-history.png) |

### 3. Doctor Dashboard
Doctors can view their daily schedule, accept/reject appointments, and write digital prescriptions.

| Doctor Dashboard | Prescription System |
|:---:|:---:|
| [Doctor Dashboard](screenshots/doctor-dashboard.png) | [Prescription Modal](screenshots/doctor-prescription.png) |

### 4. Admin Control Panel
Admins have full control over user management, allowing them to create, edit, or delete doctor and patient accounts.

[Admin Dashboard](screenshots/admin-dashboard.png)

---

## 🚀 Key Features

### 🛡️ Security & Authentication
* **Role-Based Access Control (RBAC):** Distinct dashboards for **Patients**, **Doctors**, and **Admins**.
* **Session Management:** Secure, stateful sessions using HttpOnly cookies to prevent XSS attacks.

### 👨‍⚕️ For Doctors
* **Appointment Management:** View daily schedules and approve/reject bookings.
* **FDA Integration:** Integrated with the **OpenFDA API** to search for real medicine names and dosages in real-time.

### 🏥 For Patients
* **Instant Booking:** Interactive interface to book appointments without page reloads.
* **Medical History:** View past appointments and diagnosis reports.

### 🔧 For Admins
* **User Management:** Add or remove doctors and patients.
* **System Oversight:** Monitor hospital departments and data.

---

## 🛠️ Tech Stack

### Backend
* **Java (JDK 19+)**
* **Spring Boot 3.x** (Web, Security, Data JPA)
* **MySQL** (Relational Database)

### Frontend
* **React.js** (Main Dashboard UI)
* **Thymeleaf** (Login/Register Templates)
* **Bootstrap 5** (Styling & Responsive Design)

### Deployment
* **AWS EC2** (Ubuntu Linux Server)
* **PM2** (Node.js Process Manager)
* **Systemd** (Linux Service for Java Backend)

---

## ☁️ Deployment (AWS)

This project is deployed on an **AWS EC2 Ubuntu instance**.

* **Backend:** Runs as a background service using a custom `systemd` unit file, ensuring 99.9% uptime.
* **Frontend:** Served via `serve` and managed by **PM2** to handle load balancing and crash recovery.
* **Network:** AWS Security Groups configured to allow traffic on ports `8080` (API) and `3000` (Client).

---

## 📄 License
This project is developed for the Web Design and Programming Term Project.
