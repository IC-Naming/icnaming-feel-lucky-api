-- CreateTable
CREATE TABLE "DomainName" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "domain" TEXT NOT NULL,
    "domainLength" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "DomainName_domain_key" ON "DomainName"("domain");

-- CreateIndex
CREATE INDEX "DomainName_domainLength_idx" ON "DomainName"("domainLength");
