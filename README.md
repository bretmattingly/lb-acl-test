# Loopback ACL Bug Test

This project is a minimum viable test case for Loopback.io issue [#1645](https://github.com/strongloop/loopback/issues/1645)

## How to run this test

First, do the obvious. Clone this repository, install Loopback if you haven't already (`npm install -g strongloop`),
and install this repo's dependencies (`npm install`). This example uses a MySQL database, so you'll need to set one up.
Because this is quick and dirty, we're using `root` with no password on our local machine. Don't do this in production.
Please. For the love of god.


The `create-lb-tables.js` boot script will handle migrating the ACLs to the database. You'll also need to do it for our
two other models, `document` and `person` (which extends `User`).

**Prepare Your Environment:** Install node.js, install Loopback and SLC (`npm install -g strongloop`). Instal MySQL,
MariaDB, or your database of choice. Clone this repo and install its dependencies (`npm install`). If you're not using
MySQL/MariaDB, configure `datasources.json` appropriately.

**Prepare the Test:** Run `node server/create-lb-tables.js` to migrate built in Models to the database. Use `slc arc` to
manually migrate the `person` and `document` Models to the database. Create some test data. You'll need at least one Client,
one Document, one Role, and one ACL.