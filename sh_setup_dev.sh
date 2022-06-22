git lfs install
git lfs pull -I /prisma/dev.db
git lfs pull -I /prisma2/blacklist.db
npm run schema:generate
npm run schema2:generate
# npm run start