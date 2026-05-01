-- 1. Colors table
CREATE TABLE "colors" (
    "id" TEXT NOT NULL,
    "nameKz" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "hex" TEXT,

    CONSTRAINT "colors_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "colors_nameKz_key" ON "colors"("nameKz");
CREATE UNIQUE INDEX "colors_slug_key" ON "colors"("slug");

-- 2. Product variants table
CREATE TABLE "product_variants" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "colorId" TEXT,
    "sizeKz" TEXT,
    "price" INTEGER NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "imageUrl" TEXT,
    "sku" TEXT,

    CONSTRAINT "product_variants_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "product_variants_sku_key" ON "product_variants"("sku");

-- 3. Migrate products -> variants (preserve price, stock)
INSERT INTO "product_variants" ("id", "productId", "price", "stock", "imageUrl")
SELECT
    gen_random_uuid()::text,
    "id",
    "price",
    "stock",
    "imageUrl"
FROM "products";

-- 4. Add product_variant_id to order_items
ALTER TABLE "order_items" ADD COLUMN "productVariantId" TEXT;

-- 5. Backfill order_items.productVariantId (first variant per product)
UPDATE "order_items" oi
SET "productVariantId" = (
    SELECT pv."id" FROM "product_variants" pv
    WHERE pv."productId" = oi."productId"
    LIMIT 1
);

-- 6. Add compositionKz to products
ALTER TABLE "products" ADD COLUMN "compositionKz" TEXT;

-- 7. Drop price, stock from products
ALTER TABLE "products" DROP COLUMN "price";
ALTER TABLE "products" DROP COLUMN "stock";

-- 8. Add FK product_variants -> products
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_productId_fkey"
    FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 9. Add FK product_variants -> colors
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_colorId_fkey"
    FOREIGN KEY ("colorId") REFERENCES "colors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- 10. Add FK order_items -> product_variants
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_productVariantId_fkey"
    FOREIGN KEY ("productVariantId") REFERENCES "product_variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;
