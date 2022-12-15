CREATE DATABASE U_Data;
USE U_Data;
CREATE TABLE Users (Id SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT, 
                    Username VARCHAR(20) NOT NULL, 
                    Email VARCHAR(50) NOT NULL,
                    Password_SHA256 VARCHAR(256) NOT NULL,
                    PRIMARY KEY (Id) 
);
INSERT INTO Users (Username, Email, Password_SHA256) VALUES ("Admin", "Admin.423@email.com",SHA2("Adm!n423", 256));