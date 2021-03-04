USE employee_db;

INSERT INTO department (name)
VALUES ("Sales"),
       ("Engineering"),
       ("Finance");

INSERT INTO role (title, salary, department_id)
VALUES ("Sales Lead", 80000, 1), 
       ("Salesperson", 40000, 1),
       ("Lead Engineer", 100000, 2),
       ("Junior Engineer", 50000, 2),
       ("Accountant", 100000, 3),
       ("Accounting Assistant", 40000, 3); 

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES("Jane", "Doe", 1, 1),
      ("John", "Dole", 2, NULL),
      ("Brandon", "Good", 3, 2),
      ("Kristian", "White", 4, NULL),
      ("Eve", "Hill", 5, 3),
      ("Miriam", "Lee", 6, NULL);