const inquirer = require("inquirer");
const mysql = require("mysql");

const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '12345678',
    database: 'employee_db'
});

connection.connect( err => {
    if (err) throw err;
    console.log('You are connected');
       questions();
});

function questions() {
    inquirer.prompt({
        name: "action",
        message: "What would you like to do?",
        type: "rawlist",
        choices: [
            "View all employees",
            "View all departments",
            "View all roles",
            "Add department",
            "Add role",
            "Update role",
            "Add employee",
            "Remove employee",
            "Exit"
        ]
    }).then (response => {
        switch (response.action) {
            case "View all employees":
                allEmployees();
                break;

            case "View all departments":
                allDepartments();
                break;

            case "View all roles":
                allRoles();
                break;

            case "Add department":
                addDepartment();
                break;

            case "Add role":
                addRole();
                break;

            case "Update role":
                updateRole();
                break;
            case "Add employee":
                addEmployee();
                break;


            case "Remove employee":
                removeEmployee();
                break;

            case "Exit":
                connection.end();
                break;
        }
    })
};

function allEmployees() {
    let query = "SELECT employee.id, employee.first_name, employee.last_name, role.title AS Title, ";
    query += "department.name AS Department, role.salary, manager.first_name AS Manager_First_Name, manager.last_name AS Manager_Last_Name ";
    query += "FROM employee LEFT JOIN role ON employee.role_id = role.id LEFT JOIN department ON role.department_id = department.id ";
    query += "LEFT JOIN employee manager ON manager.id = employee.manager_id "
    
    connection.query(query, (err, data) => {
        if (err) throw err;
        console.table(data);
        questions();
    });
};

function allDepartments() {
    const query = 
    "SELECT department.id, role.salary, department.name FROM department LEFT JOIN role ON role.department_id = department.id GROUP BY department.id, department.name;"
    
    connection.query(query, (err, data) => {
        if (err) throw err;
        console.table(data);
        questions();
    });
};

function allRoles() {
    let query = "SELECT role.title AS Title, name AS Department, role.salary AS Salary FROM employee_db.department ";
    query += "LEFT JOIN employee_db.role ON employee_db.department.id = employee_db.role.department_id; ";

    connection.query(query, (err, data) => {
        if (err) throw err;
        console.table(data);
        questions();
    });
};

function addDepartment() {
    inquirer.prompt(
        {
            name:"newDepartment",            
            message: "Please enter name of a new department you would like to add",
            type: "input"
        }
    ).then(response => {
        let query = "INSERT INTO department SET ?"

        connection.query(query, {name: response.newDepartment}, err => {
            if (err) throw err;
            questions();
        });
    });
};

function addRole() {
    let query = "SELECT name FROM employee_db.department";

    connection.query(query, function(err, data){
        if (err) throw err;
        let dArray = [];
        inquirer.prompt([
            {
                name:"department",            
                message: "Please choose the department where you would like to add a new role",
                type:"list",
                choices: function(){
                    for (let i =0; i< data.length; i++){
                        dArray.push(data[i].name);
                    }
                    return dArray;
                }
            }, 
            {
                name:"newRole",
                message: "Please enter the new role name",
                type: "input"
            },
            {
                name:"salary",
                message: "What is a salary for the new role?",
                type: "input"
            }
        
        ]).then(response => {
            let query = "INSERT INTO ROLE SET ?";
            connection.query(query, {
                title: response.newRole,
                salary: response.salary,
                department_id: dArray.indexOf(response.department)+1
            }, err => {
                if (err) throw err;
                questions();
            });
        });
    });
};
function updateRole() {
    let query = "SELECT DISTINCT employee1.id, employee1.first_name, employee1.last_name, role1.title AS Job_Title, ";
    query += "department1.name AS Department, role1.salary, manager1.first_name, manager1.last_name FROM employee employee1 ";
    query += "LEFT JOIN role role1 ON role1.id = employee1.role_id LEFT JOIN department department1 ON role1.department_id = department1.id LEFT JOIN employee manager1 ";
    query += "ON employee1.manager_id = manager1.id LEFT JOIN employee employee2 ON role1.id = employee2.role_id ORDER BY id";

    connection.query(query, (err, data) => {
        if (err) throw err;
        let employeeN = [];
        let roleN = []; 
        inquirer.prompt([
            {
                name: "updateEmployee",
                message: "Which employee's role you would like to update?",
                type: "rawlist",
                choices: function() {
                    for (let i = 0; i < data.length; i++){
                        employeeN.push(data[i].Employee);                        
                    }
                    return employeeN;
                }                
            },
            {
                name:"updateRole",
                message: "Please choose a new role",
                type: "rawlist",
                choices : function() {
                    for (let i = 0; i < data.length; i++){
                        roleN.push(data[i].Job_Title)
                    }
                    return roleN;
                }               
            }
        ])
        .then(response => {
            connection.query("UPDATE role SET title = ? where id = ?", 
                [
                response.updateRole, 
                employeeN.indexOf(response.updateEmployee)+1
                ]);
            questions();
        })
   })
};
function addEmployee() {
    let query = "SELECT * FROM role";

    connection.query(query, (err, data) => {
        if (err) throw err;

        let roleArray = [];
        inquirer.prompt([
            {
                name:"role",
                message: "Please choose the employee's role",
                type:"rawlist",
                choices: function() {
                    for (let i = 0; i < data.length; i++){
                        roleArray.push(data[i].title);
                    }
                    return roleArray;
                }                
            },
            {
                name:"firstName",
                message: "What is the employee's first name?",
                type:"input"                
            },
            {
                name:"lastName",
                type: "input",
                message: "What is the employee's last name?"
            },
            {
                name:"managerId",
                type: "input",
                message: "What is the employee's manager id number?"
            }
        ]) 
        .then(response => {
            connection.query("INSERT INTO employee SET ?",
            {
                first_name: response.firstName,
                last_name: response.lastName,
                role_id: roleArray.indexOf(response.role)+1,
                manager_id: response.managerID
                
            });
            questions();
        
        });
    });
};
function removeEmployee() {
    let query = "SELECT DISTINCT employee.id, employee.first_name, employee.last_name FROM employee";

    connection.query(query, (err, data) => {
        if (err) throw err;
        let employeeArray = [];
        for(i = 0; i < data.length; i++){
            let employeeToDel = {
                name: data[i].name,
                value: data[i].id
            }
            employeeArray.push(employeeToDel);
        };
        console.table(employeeArray);
        inquirer.prompt([
            {
                name:"employeeDel",
                type: "rawlist",
                message: "Please choose the employee you would like to delete",
                choices: employeeArray
            }
        ]).then(choose => {
            let query = "DELETE FROM employee WHERE employee.id = ?";

            connection.query(query, choose.employeeDel, err => {
                if (err) throw err;
                console.log("Employee successfully deleted");
                questions();
            });
        });
    });
};