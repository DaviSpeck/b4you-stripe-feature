**Sequelize instructions**

**Migrations**

-Create a migration
yarn sequelize migration:create --name=create-users

-Run all migrations
NODE_ENV=dev yarn sequelize db:migrate

**Seeds**

-Create a seed
yarn sequelize seed:generate --name transaction-types

-Run all seeds
NODE_ENV=dev yarn sequelize db:seed:all

-Undo last seed
NODE_ENV=dev yarn sequelize db:seed:undo

-Undo all seeds
NODE_ENV=dev yarn sequelize db:seed:undo:all

-Run specific seed
NODE_ENV=dev yarn sequelize db:seed --seed 20201109204855-update-transaction-status-company
