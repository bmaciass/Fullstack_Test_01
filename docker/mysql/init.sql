-- Grant privileges to the jelou user for shadow database creation
GRANT CREATE, ALTER, DROP, REFERENCES, INDEX ON *.* TO 'jelou'@'%';
FLUSH PRIVILEGES;