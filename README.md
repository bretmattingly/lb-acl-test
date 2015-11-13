# Loopback ACL Bug Test

This project is a minimum viable test case for Loopback.io issue [#1645](https://github.com/strongloop/loopback/issues/1645)

## How to run this test

**Prepare Your Environment:** Install node.js, install Loopback and SLC (`npm install -g strongloop`). Instal MySQL,
MariaDB, or your database of choice. Clone this repo and install its dependencies (`npm install`). If you're not using
MySQL/MariaDB, configure `datasources.json` appropriately.

**Prepare the Test:** Run `node server/create-lb-tables.js` to migrate built in Models to the database. Use `slc arc` to
manually migrate the `person` and `document` Models to the database. Create some test data. You'll need at least one Client,
one Document, one Role, and one ACL. You can use the sample data in `testutils/test-data.json` for the Client and Document.
For the ACLs, we're going to create one in memory (defined on a model) and one in the database. For the ACL in memory, use
`slc loopback:acl` like so:

```
$ slc loopback:acl
? Select the model to apply the ACL entry to: document
? Select the ACL scope: All methods and properties
? Select the access type: Read
? Select the role: All users
? Select the permission to apply: Explicitly deny access
```

What we're going to attempt to do is allow only one user ("Bort") access to read our documents. Everyone else should be
denied. To do this, let's create an ACL in the Database. It looks something like this:

```
INSERT INTO ACL (model, property, accessType, permission, principalType, principalId)
VALUES ("document", NULL, "READ", "ALLOW", "USER", 1);
```

Finally, prepare to read security debugging output by setting `DEBUG=loopback:security:*` in your shell.

**Begin the Test:** Fire up your app (`node .`) and go over to the StrongLoop Explorer at `0.0.0.0:3000`. Attempt to
`GET /documents`, without being authorized as a user. You should get a 401 error. This is expected behavior. Now, login
as a user `POST /clients/login` and get your access token. Note that you may need to login using a tool like Postman,
since the form in the StrongLoop Explorer appears to submit malformed credentials. Once you have your access token, set
it in the Explorer and try to `GET /documents` again. You'll be denied once again. This is **not** expected behavior.
Instead, we would expect to be allowed access (since we have an explicit ACL that matches our user).

Observe the debug output in your terminal:

```
  loopback:security:role isInRole(): $everyone +0ms
  loopback:security:access-context ---AccessContext--- +1ms
  loopback:security:access-context principals: [] +1ms
  loopback:security:access-context modelName document +0ms
  loopback:security:access-context modelId undefined +0ms
  loopback:security:access-context property find +0ms
  loopback:security:access-context method find +0ms
  loopback:security:access-context accessType READ +0ms
  loopback:security:access-context accessToken: +0ms
  loopback:security:access-context   id "$anonymous" +0ms
  loopback:security:access-context   ttl 1209600 +0ms
  loopback:security:access-context getUserId() null +0ms
  loopback:security:access-context isAuthenticated() false +1ms
  loopback:security:role Custom resolver found for role $everyone +0ms
  loopback:security:acl The following ACLs were searched:  +1ms
  loopback:security:acl ---ACL--- +1ms
  loopback:security:acl model document +0ms
  loopback:security:acl property * +0ms
  loopback:security:acl principalType ROLE +0ms
  loopback:security:acl principalId $everyone +0ms
  loopback:security:acl accessType READ +0ms
  loopback:security:acl permission DENY +0ms
  loopback:security:acl with score: +0ms 7623
  loopback:security:acl ---Resolved--- +0ms
  loopback:security:access-context ---AccessRequest--- +0ms
  loopback:security:access-context  model document +0ms
  loopback:security:access-context  property find +1ms
  loopback:security:access-context  accessType READ +0ms
  loopback:security:access-context  permission DENY +0ms
  loopback:security:access-context  isWildcard() false +0ms
  loopback:security:access-context  isAllowed() false +0ms

  # Second, authenticated request.
  loopback:security:role isInRole(): $everyone +3m
  loopback:security:access-context ---AccessContext--- +0ms
  loopback:security:access-context principals: +0ms
  loopback:security:access-context principal: {"type":"USER","id":1} +0ms
  loopback:security:access-context modelName document +0ms
  loopback:security:access-context modelId undefined +0ms
  loopback:security:access-context property find +0ms
  loopback:security:access-context method find +0ms
  loopback:security:access-context accessType READ +1ms
  loopback:security:access-context accessToken: +0ms
  loopback:security:access-context   id "1l6FVSC6GDXfBnSWg9zCBUFSCFmJwDlAxa5YBAfVyF52QntMNr5ZXH3QthCHmAgM" +0ms
  loopback:security:access-context   ttl 1209600 +0ms
  loopback:security:access-context getUserId() 1 +0ms
  loopback:security:access-context isAuthenticated() true +0ms
  loopback:security:role Custom resolver found for role $everyone +0ms
  loopback:security:acl The following ACLs were searched:  +0ms
  loopback:security:acl ---ACL--- +1ms
  loopback:security:acl model document +0ms
  loopback:security:acl property * +0ms
  loopback:security:acl principalType ROLE +0ms
  loopback:security:acl principalId $everyone +0ms
  loopback:security:acl accessType READ +0ms
  loopback:security:acl permission DENY +0ms
  loopback:security:acl with score: +0ms 7623
  loopback:security:acl ---Resolved--- +0ms
  loopback:security:access-context ---AccessRequest--- +0ms
  loopback:security:access-context  model document +0ms
  loopback:security:access-context  property find +0ms
  loopback:security:access-context  accessType READ +0ms
  loopback:security:access-context  permission DENY +0ms
  loopback:security:access-context  isWildcard() false +0ms
  loopback:security:access-context  isAllowed() false +0ms
```

It appears that, regardless of configuration in `model-config.json`, ACLs in databases are never even SEARCHED! To confirm
that the in-memory ACL isn't preventing us from searching, let's remove it from `document.json` temporarily and try again.

### Response Body:
```
[
  {
    "name": "Tales From Test Town",
    "text": "And one man's eventual loss of sanity",
    "id": 1
  },
  {
    "name": "Adventures in QA",
    "text": "ʞlɐʇ I ʍoɥ sᴉ sᴉɥʇ 'ʇuǝɔɔɐ uɐ ǝʌɐɥ ʇ,uop I",
    "id": 2
  }
]
```

### Debug Output:
```
loopback:security:acl The following ACLs were searched:  +0ms
  loopback:security:acl ---Resolved--- +0ms
  loopback:security:access-context ---AccessRequest--- +1ms
  loopback:security:access-context  model document +0ms
  loopback:security:access-context  property find +0ms
  loopback:security:access-context  accessType READ +0ms
  loopback:security:access-context  permission ALLOW +0ms
  loopback:security:access-context  isWildcard() false +1ms
  loopback:security:access-context  isAllowed() true +0ms
```

Here we're allowed access, and no database ACLs are searched.