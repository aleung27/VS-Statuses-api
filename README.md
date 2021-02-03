# :loudspeaker: VS Statuses API :loudspeaker:
![GitHub release (latest by date including pre-releases)](https://img.shields.io/github/v/release/aleung27/VS-Statuses-api?include_prereleases)

[![GitHub stars](https://img.shields.io/github/stars/aleung27/VS-Statuses-api)](https://github.com/aleung27/VS-Statuses-api/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/aleung27/VS-Statuses-api)](https://github.com/aleung27/VS-Statuses-api/issues)
![GitHub commit activity](https://img.shields.io/github/commit-activity/y/aleung27/VS-Statuses-api)

[![GitHub license](https://img.shields.io/github/license/aleung27/VS-Statuses-api)](https://github.com/aleung27/VS-Statuses-api/blob/master/LICENSE)
[![Twitter](https://img.shields.io/twitter/url?style=social&url=https%3A%2F%2Fgithub.com%2Faleung27%2FVS-Statuses-api)](https://twitter.com/intent/tweet?text=Wow:&url=https%3A%2F%2Fgithub.com%2Faleung27%2FVS-Statuses-api)

API for the [VS Statuses extension](https://github.com/aleung27/VS-Statuses). Requests to the API are processed with new status updates from users being stored in a MYSQL database. Updates from users you are following are then returned by the API to be processed by the extension.

This API is built upon the Express.js framework utilising Typescript for added type safety.  

## :computer: Installation & Usage :computer:

The API can be run locally over HTTPS by generating your own SSL Certificates and trusting them. By default the API runs on port 8000. To generate your own certificates and keys type the following:

```
openssl req -x509 -newkey rsa:2048 -keyout keytmp.pem -out cert.pem -days 365
openssl rsa -in keytmp.pem -out key.pem
```

This generates the `cert.pem` and `key.pem` certificates that are used in the API to create the HTTPS server. For more information visit the Express docs or the following link. [Click Here](https://medium.com/@nitinpatel_20236/how-to-create-an-https-server-on-localhost-using-express-366435d61f28).

Ensure you have the normal npm stuff installed before you run the following commands:

```
cd VS-Statuses-api
npm i
npm run start
```

## :evergreen_tree: Environment Variables :evergreen_tree:

Create a .env file in the root of the project and add the following fields with their respective values:

- NODE_ENV
- TYPEORM_CONNECTION
- TYPEORM_HOST
- TYPEORM_USERNAME
- TYPEORM_PASSWORD
- TYPEORM_DATABASE
- TYPEORM_PORT
- TYPEORM_ENTITIES
- ACCESS_TOKEN_SECRET
- REFRESH_TOKEN_SECRET

Optionally TYPEORM_SYNCHRONIZE and TYPEORM_LOGGING may also be specified for a development environment.

See [TypeORM](https://typeorm.io/) for more information on configuring your local database with the env variables.

## :handshake: Contribution Guide :handshake:

:heart: Great that you want to contribute; contributions are always very welcome! :heart:

Usual Github contribution flow:
1. Fork this repository
2. Clone your fork to your local development environment
3. Create a branch from `master` for you to work off of
4. Commit and push your changes
5. Open a pull request
6. Wait to get approved!

:sparkles::sparkles: And your done! :sparkles::sparkles:

Make sure to add comments as you make your changes. Follow existing coding patterns and idioms already present in the project.
