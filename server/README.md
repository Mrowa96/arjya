# arjya-server

Docs are available under `/docs` endpoint.

## How to run migrations?

Run `node ./scripts/migrate.ts ACTION [NAME]`

`ACTION` is either `up` or `down`

`NAME` is optional migration name.

Examples:

- Run all migrations up: `node ./scripts/migrate.ts up`
- Run all migrations down: `node ./scripts/migrate.ts down`
- Run single migrations up: `node ./scripts/migrate.ts up xxx_migration_name`
- Run single migrations down: `node ./scripts/migrate.ts down xxx_migration_name`

## How to run other scripts?

Just run `node ./scripts/<script>`

## Additional docs

- https://github.com/jalik/meteor-jalik-ufs/blob/master/ufs-server.js#L342
- https://github.com/jalik/meteor-jalik-ufs/issues/142
- https://datatracker.ietf.org/doc/html/rfc7233#section-4.1
- https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Range_requests

## Example podcasts urls

- https://feeds.buzzsprout.com/1821877.rss
- https://anchor.fm/s/1397f78/podcast/rss
- https://dzialzagraniczny.libsyn.com/rss
- https://anchor.fm/s/5c81fea0/podcast/rss
- https://anchor.fm/s/9b4c3f38/podcast/rss
