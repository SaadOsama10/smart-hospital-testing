# 🏥 Smart Hospital — Software Verification & Testing

**A full verification, validation and security testing campaign for a Spring Boot + React hospital appointment system: 88 test cases across functional, performance, usability and security testing, with all 58 functional tests automated in Selenium.**

<p>
  <img src="https://img.shields.io/badge/Java-1a1b27?style=flat-square&logo=openjdk&logoColor=7aa2f7" alt="Java" />
  <img src="https://img.shields.io/badge/Spring_Boot-1a1b27?style=flat-square&logo=springboot&logoColor=7aa2f7" alt="Spring Boot" />
  <img src="https://img.shields.io/badge/React-1a1b27?style=flat-square&logo=react&logoColor=7aa2f7" alt="React" />
  <img src="https://img.shields.io/badge/MySQL-1a1b27?style=flat-square&logo=mysql&logoColor=7aa2f7" alt="MySQL" />
  <img src="https://img.shields.io/badge/Selenium-1a1b27?style=flat-square&logo=selenium&logoColor=7aa2f7" alt="Selenium" />
  <img src="https://img.shields.io/badge/Apache_JMeter-1a1b27?style=flat-square&logo=apachejmeter&logoColor=7aa2f7" alt="Apache JMeter" />
  <img src="https://img.shields.io/badge/OWASP_ZAP-1a1b27?style=flat-square" alt="OWASP ZAP" />
  <img src="https://img.shields.io/badge/QA-1a1b27?style=flat-square" alt="QA" />
</p>

👥 **ZeroDay Squad:** Saed O S Radi (Test Manager), Anas Alhatti, Abdulrahman Aljabahji, Ahmed Alsaleh — app repo: [AnasAlhatti/Smart-Hospital-Appointment-System](https://github.com/AnasAlhatti/Smart-Hospital-Appointment-System)

---

## 📊 Results at a Glance

| Testing type | Test cases | Pass | Fail | Pass rate | Tools |
|---|---:|---:|---:|---:|---|
| Functional | 58 | 55 | 3 | 94.8% | Selenium WebDriver 4.18.1, WebDriverManager 5.7.0, JDBC |
| Performance | 7 | 7 | 0 | 100% | Apache JMeter 5.6.3 |
| Usability | 10 | 10 | 0 | 100% | Think-Aloud Protocol, 5 independent testers |
| Security | 13 | 10 | 3 | 76.9% | OWASP ZAP 2.17, Chrome DevTools, IntelliJ IDEA |
| **Total** | **88** | **82** | **6** | **93.2%** | **Execution rate: 88/88 (100%)** |

**4 defects** were logged (2 High, 2 Medium). See [Defects](#-defects) for their current status.

*All figures come from the [Test Execution Report](testing/docs/03_Test_Execution_Report.pdf) and the [Defect Report](testing/docs/04_Defect_Report.pdf).*

---

## 🎯 System Under Test

The **Smart Hospital Appointment System** is a full-stack web app with three roles: **Patients** register and book appointments, **Doctors** accept or reject them and write prescriptions (with OpenFDA medicine search), and **Admins** manage doctors, patients and departments.

- **Backend:** Java 21, Spring Boot 4.0 (per `pom.xml`; the Test Plan lists 3.x), Spring Security with role-based access control, HTTPS (self-signed) and HttpOnly `JSESSIONID` cookies
- **Frontend:** React dashboards plus Thymeleaf login/registration pages
- **Database:** MySQL (`hospital_db`)
- **Test environment:** macOS (Apple Silicon), Chrome, backend on `https://localhost:8080`, frontend on `http://localhost:3000`, MySQL on `localhost:3306`

The application was built by Anas Alhatti and a co-developer; its original README is preserved in [APP_README.md](APP_README.md).

---

## 🧭 Test Strategy

Defined in the [Test Plan](testing/docs/01_Test_Plan.pdf):

| Approach | Where it was applied |
|---|---|
| **Black-box** | All functional, usability and performance tests — designed from requirements, executed through the UI and HTTP endpoints |
| **White-box** | Security tests that inspect source and configuration directly (e.g. `SecurityConfig.java`, controller logic) |
| **Gray-box** | OWASP ZAP and Chrome DevTools security testing, and the Selenium suite, which knows the UI structure and seeds/cleans test data in MySQL via JDBC |

**Test design techniques:** equivalence partitioning, boundary value analysis (password exactly 8 characters, username exactly 4 characters), negative testing, empty-field validation on every form, and RBAC checks via URL manipulation.

**Exit criteria (from the plan):** ≥95% of test cases executed, all Critical/High defects documented with resolution attempted, all 7 JMeter scenarios measured, the ZAP scan completed, and usability sessions finished with all 5 testers. The campaign executed 100% of test cases.

### Test levels

All testing was done at the **system level**: the running app (React + Spring Boot + MySQL) was exercised end-to-end through the browser and HTTP.

| Level | What exists in this repo |
|---|---|
| **System** | 88 documented test cases. The 58 functional cases are automated in [`RunSeleniumTests.java`](src/test/java/com/example/smarthospitalsystem/RunSeleniumTests.java). Performance, usability and security were executed with their own tools. |
| **Integration** | No separate integration suite. Frontend ↔ backend ↔ database integration is covered indirectly by the end-to-end system tests. |
| **Unit** | No unit test suite — only Spring Boot's generated `contextLoads()` test and Create React App's default `App.test.js`. |

No code-coverage reports were produced.

---

## 🧪 Functional Testing — 58 cases, all automated

[`RunSeleniumTests.java`](src/test/java/com/example/smarthospitalsystem/RunSeleniumTests.java) drives Chrome through Selenium WebDriver (WebDriverManager handles the driver). Where a case needs specific data (e.g. an existing appointment), it inserts it into MySQL over JDBC and cleans it up afterwards. It is an interactive runner: start it, then choose one test case (1–58) or `0` to run all of them.

| Area | Cases | Examples |
|---|---:|---|
| Authentication & session | 9 | Valid login for each role, invalid credentials, empty fields, logout, session after refresh, case-sensitive passwords |
| Registration | 11 | Valid registration, weak password, duplicate username, empty fields, invalid characters, boundary values |
| Patient module | 12 | Departments, booking, medical history, empty/past-date/duplicate bookings, RBAC on admin and doctor pages |
| Doctor module | 9 | View, accept and reject appointments, write prescriptions, refresh, empty prescription fields, RBAC |
| Admin module | 17 | Create, edit and delete doctors and patients, manage departments, empty-field validation, RBAC |

**Failures:** TC-FUNC-010 (booking always failed — DEF-002), TC-FUNC-013 (creating a patient threw a `NullPointerException` — DEF-003) and TC-FUNC-028 (duplicate-booking prevention could not be verified because booking itself failed — DEF-002).

## ⚡ Performance Testing — Apache JMeter

| ID | Scenario | Avg | Max | Errors | Result |
|---|---|---:|---:|---:|---|
| TC-PERF-001 | Response time, 10 users | 63 ms | 211 ms | 0% | ✅ |
| TC-PERF-002 | Load test, 50 users | 48 ms | 211 ms | 0% | ✅ |
| TC-PERF-003 | Stress test, 100 users | 44 ms | 211 ms | 0% | ✅ |
| TC-PERF-004 | Login endpoint, 20 concurrent POSTs | 45 ms | 292 ms | 0% | ✅ |
| TC-PERF-005 | Patient dashboard, 10 users | 44 ms | 292 ms | 0% | ✅ |
| TC-PERF-006 | Booking endpoint, 20 users | 43 ms | 292 ms | 0% | ✅ |
| TC-PERF-007 | Admin dashboard, 15 users | 43 ms | 292 ms | 0% | ✅ |

## 🧑‍🤝‍🧑 Usability Testing — Think-Aloud, 5 testers

10 task-based and rating cases, all passed. Every tester completed every task: finding the booking flow (avg 1 m 45 s), creating a doctor as admin (avg 1 m 32 s), finding the register link (avg 18 s) and spotting a pending appointment (avg 42 s). Overall satisfaction averaged **3.6 / 5** against a 3.5 target (navigation 4.0, clarity 3.2); visual consistency was rated 4.0 / 5. The main feedback was that error messages could explain more.

## 🔐 Security Testing — OWASP ZAP, DevTools, code review

| Result | Test cases |
|---|---|
| ✅ Passed (10) | SQL injection on login, XSS on registration, OWASP ZAP automated scan (missing security headers noted), cookie security flags, unauthorized admin access, password strength, session invalidation, directory traversal, no sensitive data in URLs, no cross-patient data leakage |
| ❌ Failed (3) | TC-SEC-004 and TC-SEC-013 — no brute-force protection or account lockout after 10+ failed logins (DEF-004); TC-SEC-009 — CSRF protection disabled (DEF-001) |

---

## 🐞 Defects

| ID | Title | Severity | Status in Defect Report | Status in this repo's code |
|---|---|---|---|---|
| DEF-001 | CSRF protection disabled | High | Closed | ⚠️ **Still open** — see note below |
| DEF-002 | Appointment booking always fails | High | Closed | ✅ Fixed — the frontend now calls `/appointments/book` with the `dateTime` field the backend expects |
| DEF-003 | Admin "create patient" throws `NullPointerException` | Medium | Closed | ✅ Fixed — `AdminController` maps a `UserRequest` DTO and null-checks the password |
| DEF-004 | No brute-force protection on login | Medium | Open | Open |

> ⚠️ **DEF-001 note:** the Defect Report marks DEF-001 as *Closed*, but [`SecurityConfig.java`](src/main/java/com/example/smarthospitalsystem/config/SecurityConfig.java) in this repository still calls `.csrf(AbstractHttpConfigurer::disable)`, so CSRF protection remains **disabled in the code**.

---

## 📁 Test Documentation & Evidence

| Document | Contents |
|---|---|
| [01 — Test Plan](testing/docs/01_Test_Plan.pdf) | Scope, in/out-of-scope features, strategy, roles, schedule, entry/exit criteria, environment and tools |
| [02 — Test Case Design](testing/docs/02_Test_Case_Design.pdf) | The 88 test cases with requirements, steps and expected results |
| [03 — Test Execution Report](testing/docs/03_Test_Execution_Report.pdf) | Actual results, pass/fail status, dates, testers and evidence for every case |
| [04 — Defect Report](testing/docs/04_Defect_Report.pdf) | DEF-001 to DEF-004 with reproduction steps, severity, priority and status |

Student numbers and the names of the five external usability testers (shown as Tester 1–5) have been redacted from the PDFs.

[`testing/evidence/`](testing/evidence/) holds **53 screenshots** referenced by the execution report, named by test-case ID (e.g. `TC-FUNC-013-FAIL.png`, `TC-PERF-003.png`, `TC-SEC-009-FAIL.png`).

---

## ▶️ Running the App and the Selenium Suite

**Prerequisites:** JDK 21+, Node.js, MySQL 8+, Google Chrome.

```bash
# 1. Configure credentials
cp .env.example .env          # set DB_PASSWORD and SSL_KEYSTORE_PASSWORD
set -a; source .env; set +a

# 2. Create the MySQL database
mysql -u "$DB_USERNAME" -p -e "CREATE DATABASE IF NOT EXISTS hospital_db;"

# 3. Generate a local self-signed certificate (the dev profile serves HTTPS on :8080)
keytool -genkeypair -alias tomcat -keyalg RSA -keysize 2048 -storetype PKCS12 \
  -keystore src/main/resources/keystore.p12 -validity 365 \
  -dname "CN=localhost" -storepass "$SSL_KEYSTORE_PASSWORD"

# 4. Start the backend (https://localhost:8080)
./mvnw spring-boot:run

# 5. Start the frontend (http://localhost:3000) in a second terminal
cd frontend && npm install && npm start
```

Open `https://localhost:8080` once in Chrome and accept the self-signed certificate.

**Selenium suite:** it logs in as `testadmin`, `doctor2` and `patient1` (passwords are in the [Test Plan](testing/docs/01_Test_Plan.pdf), section 6.1), so create those accounts in your local database first. Then, with the app running and the same `.env` exported, run `RunSeleniumTests.main()` from IntelliJ IDEA, or:

```bash
./mvnw -q test-compile exec:java \
  -Dexec.mainClass=com.example.smarthospitalsystem.RunSeleniumTests \
  -Dexec.classpathScope=test
```

Enter a test number (1–58), or `0` to run all 58.

---

## 🗂️ Project Structure

```
.
├── src/main/java/…/smarthospitalsystem/   # Spring Boot backend (config, controllers, models, services)
├── src/main/resources/                    # application*.properties (credentials via env vars), Thymeleaf templates
├── src/test/java/…/RunSeleniumTests.java  # Selenium + JDBC automation of the 58 functional test cases
├── frontend/                              # React dashboards
├── testing/
│   ├── docs/                              # Test Plan, Test Case Design, Execution Report, Defect Report (PDF)
│   └── evidence/                          # 53 screenshots named by test-case ID
├── screenshots/                           # App screenshots used by APP_README.md
├── APP_README.md                          # Original application README
└── .env.example
```

## 🙏 Credits

The application was developed by Anas Alhatti and a co-developer; its commit history is preserved in this repository. ZeroDay Squad planned and executed the testing, wrote the documentation and fixed DEF-002 and DEF-003.
