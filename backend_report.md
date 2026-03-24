# Backend Implementation Report: Smart Expense Tracker

## 1. Executive Summary
The Smart Expense Tracker backend is a robust RESTful API built with **Java 21**, **Spring Boot 3.3.5**, and **Spring Data JPA**. It uses a monolithic service-oriented architecture designed to handle user accounts, transaction processing, budget tracking, and a rigorous double-entry accounting ledger system.

## 2. Technology Stack
* **Core Framework**: Java 21, Spring Boot 3.3.5
* **Data Access**: Spring Data JPA, Hibernate
* **Database**: MySQL 8.4 (for Production/Local dev via [application.properties](file:///c:/Users/admin/Desktop/projects/SmartExpenseTracker/backend/src/main/resources/application.properties)), H2 Database (for Testing/in-memory via [application.yml](file:///c:/Users/admin/Desktop/projects/SmartExpenseTracker/backend/src/main/resources/application.yml) `dev` profile)
* **Build Tool**: Maven ([pom.xml](file:///c:/Users/admin/Desktop/projects/SmartExpenseTracker/backend/pom.xml), [mvnw](file:///c:/Users/admin/Desktop/projects/SmartExpenseTracker/backend/mvnw))
* **Security & Auth**: Custom JWT implementation (via `jjwt` library)
* **Utilities**: Lombok (boilerplate reduction), Validation (`spring-boot-starter-validation`)

## 3. Architecture & Project Structure
The project follows a standard Clean Architecture approach, organized into package-by-feature domains (e.g., [User](file:///c:/Users/admin/Desktop/projects/SmartExpenseTracker/backend/src/main/java/com/example/backend/User/Model/UserDB.java#19-55), [Account](file:///c:/Users/admin/Desktop/projects/SmartExpenseTracker/backend/src/main/java/com/example/backend/Account/Model/AccountDB.java#10-40), [Transaction](file:///c:/Users/admin/Desktop/projects/SmartExpenseTracker/backend/src/main/java/com/example/backend/Transaction/Model/TransactionDB.java#15-72), `Ledger`, [Budget](file:///c:/Users/admin/Desktop/projects/SmartExpenseTracker/backend/src/main/java/com/example/backend/Budget/Model/Budget.java#10-83), [Category](file:///c:/Users/admin/Desktop/projects/SmartExpenseTracker/backend/src/main/java/com/example/backend/Category/Model/Category.java#11-48), [Auth](file:///c:/Users/admin/Desktop/projects/SmartExpenseTracker/backend/src/main/java/com/example/backend/Auth/Util/AuthContext.java#14-55)).
Each domain generally adheres to standard REST layers:
* **Controllers**: Exposes REST endpoints (`@RestController`) and handles HTTP requests.
* **Services**: Contains core business logic and orchestrated cross-repository operations (`@Service`).
* **Repositories**: Interfaces extending JpaRepository for database interactions (`@Repository`).
* **Models**: JPA JPA entities mapping to database tables (`@Entity`).
* **DTOs**: Data Transfer Objects used to sanitize inputs/outputs and decouple APIs from DB schemas.
* **Exceptions**: Domain-specific exception handlers and global REST controller advices (`@RestControllerAdvice`).

## 4. Core Domains & Features

### 4.1. User & Authentication
* **Model**: [UserDB](file:///c:/Users/admin/Desktop/projects/SmartExpenseTracker/backend/src/main/java/com/example/backend/User/Model/UserDB.java#19-55) stores `name`, `email`, `phone`, `password`, and activation `status`.
* **Flow**: [AuthController](file:///c:/Users/admin/Desktop/projects/SmartExpenseTracker/backend/src/main/java/com/example/backend/Auth/Controller/AuthController.java#12-31) handles `/api/auth/register` and `/api/auth/login`.
* **Security**: Instead of a complex Spring Security filter chain, the application uses manual JWT extraction. An [AuthContext](file:///c:/Users/admin/Desktop/projects/SmartExpenseTracker/backend/src/main/java/com/example/backend/Auth/Util/AuthContext.java#14-55) utility class extracts the token from the `Authorization: Bearer <token>` header of incoming `HttpServletRequest` objects, validates it via [JwtService](file:///c:/Users/admin/Desktop/projects/SmartExpenseTracker/backend/src/main/java/com/example/backend/Auth/Service/JwtService.java#14-71), and extracts the `userId` to verify permissions.

### 4.2. Account Management
* **Model**: [AccountDB](file:///c:/Users/admin/Desktop/projects/SmartExpenseTracker/backend/src/main/java/com/example/backend/Account/Model/AccountDB.java#10-40) defines financial accounts tied to a [UserDB](file:///c:/Users/admin/Desktop/projects/SmartExpenseTracker/backend/src/main/java/com/example/backend/User/Model/UserDB.java#19-55).
* **Features**: Tracks `accountNumber`, `accountType`, and `active` status. Crucial for determining where transactions originate and resolve to.

### 4.3. Categories & Budgets
* **Models**: [Category](file:///c:/Users/admin/Desktop/projects/SmartExpenseTracker/backend/src/main/java/com/example/backend/Category/Model/Category.java#11-48) and [Budget](file:///c:/Users/admin/Desktop/projects/SmartExpenseTracker/backend/src/main/java/com/example/backend/Budget/Model/Budget.java#10-83).
* **Categories**: Define groups for transactions (e.g., Groceries, Entertainment) with types (Income, Expense) and statuses.
* **Budgets**: [Budget](file:///c:/Users/admin/Desktop/projects/SmartExpenseTracker/backend/src/main/java/com/example/backend/Budget/Model/Budget.java#10-83) represents an allocated amount limit for a specific [Category](file:///c:/Users/admin/Desktop/projects/SmartExpenseTracker/backend/src/main/java/com/example/backend/Category/Model/Category.java#11-48) and user over a date range (`startDate`, `endDate`). It automatically tracks `spentAmount` to help identify when a user exceeds their limit.

### 4.4. Transaction Processing
* **Model**: [TransactionDB](file:///c:/Users/admin/Desktop/projects/SmartExpenseTracker/backend/src/main/java/com/example/backend/Transaction/Model/TransactionDB.java#15-72) records every money movement attempt (both successful and failed).
* **Details**: Contains a unique `referenceId`, a source (`fromAccountId`), a destination (`toAccountId`), the transaction `amount`, `status` (e.g., SUCCESS, FAILED), and `type`.

### 4.5. The Ledger (Double-Entry Accounting)
* **Models**: [JournalEntry](file:///c:/Users/admin/Desktop/projects/SmartExpenseTracker/backend/src/main/java/com/example/backend/Ledger/Model/JournalEntry.java#14-78), `JournalLines`.
* **Mechanism**: This is an immutable audit log system enforcing financial integrity. A single transaction may produce a [JournalEntry](file:///c:/Users/admin/Desktop/projects/SmartExpenseTracker/backend/src/main/java/com/example/backend/Ledger/Model/JournalEntry.java#14-78) containing multiple `JournalLines`.
* **Validation**: The [JournalEntry](file:///c:/Users/admin/Desktop/projects/SmartExpenseTracker/backend/src/main/java/com/example/backend/Ledger/Model/JournalEntry.java#14-78) entity possesses business logic ([isBalanced()](file:///c:/Users/admin/Desktop/projects/SmartExpenseTracker/backend/src/main/java/com/example/backend/Ledger/Model/JournalEntry.java#63-77)) that ensures the sum of all DEBIT lines equals the sum of all CREDIT lines before the transaction can be persisted. If unbalanced, the transaction is rejected, providing strict financial accuracy.

## 5. Configurations
Configurations are divided among application properties:
* [application.properties](file:///c:/Users/admin/Desktop/projects/SmartExpenseTracker/backend/src/main/resources/application.properties): Dedicated to MySQL database configurations, Hibernate auto-DDL (`update`), credentials, and query logging.
* [application.yml](file:///c:/Users/admin/Desktop/projects/SmartExpenseTracker/backend/src/main/resources/application.yml): Defines the active Spring profile, JWT secret keys, token expirations (24h default), logging levels, and the application name (`ledger-service`).
* Profiles allow easy switching between local database persistence and testing configurations.

## 6. Conclusion
The backend is exceptionally well-structured for a financial application. The inclusion of a formal double-entry ledger ([JournalEntry](file:///c:/Users/admin/Desktop/projects/SmartExpenseTracker/backend/src/main/java/com/example/backend/Ledger/Model/JournalEntry.java#14-78) & `JournalLines`) alongside a distinct [Transaction](file:///c:/Users/admin/Desktop/projects/SmartExpenseTracker/backend/src/main/java/com/example/backend/Transaction/Model/TransactionDB.java#15-72) record separates user-intent from immutable financial truths, satisfying a major financial consistency requirement often missed in simple expense trackers. By utilizing a package-by-feature layout, the application remains scalable and highly maintainable.
