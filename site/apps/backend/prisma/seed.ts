import { PrismaClient, Role, OrderStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as path from 'path';
import * as fs from 'fs';

const prisma = new PrismaClient();

const citiesData = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'seed-data/cities-kz.json'), 'utf-8'),
);
const namesData = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'seed-data/kazakh-names.json'), 'utf-8'),
);
const colorsData = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'seed-data/colors.json'), 'utf-8'),
);
const catalogData = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'seed-data/products-catalog.json'), 'utf-8'),
);

const streetTypes = ['көше', 'даңғыл', 'проспект', 'жол'];
const streetNames = ['Абай', 'Достық', 'Сәтпаев', 'Байзақов', 'Тұран', 'Республика', 'Әл-Фараби', 'Мәңгілік Ел'];

const imageUrls = [
  'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400',
  'https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=400',
  'https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=400',
  'https://images.unsplash.com/photo-1518895312231-a9e23508077d?w=400',
  'https://images.unsplash.com/photo-1496062031456-07b8f162a322?w=400',
];

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function genPhone(): string {
  const operator = randomChoice(['701', '702', '705', '707', '708', '747', '750', '771', '775', '776', '777', '778']);
  const num = randomInt(1000000, 9999999);
  return `+7 ${operator} ${String(num).slice(0, 3)} ${String(num).slice(3, 5)} ${String(num).slice(5, 7)}`;
}

function slugify(text: string): string {
  const tr: Record<string, string> = {
    'ә': 'a', 'ғ': 'g', 'қ': 'q', 'ң': 'n', 'ө': 'o', 'ү': 'u', 'ұ': 'u', 'һ': 'h',
    'і': 'i',
  };
  return text
    .toLowerCase()
    .replace(/[әғқңөүұһі]/g, (c) => tr[c] ?? c)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

async function main() {
  console.log('Seed басталуда...');

  // DeliveryCity
  for (const c of citiesData) {
    await prisma.deliveryCity.upsert({
      where: { nameKz: c.nameKz },
      create: {
        nameKz: c.nameKz,
        regionKz: c.regionKz,
        deliveryFee: 2000,
      },
      update: {},
    });
  }
  console.log('DeliveryCity дайын');

  const cities = await prisma.deliveryCity.findMany();

  // Categories
  const categoriesData = [
    { nameKz: 'Раушандар', slug: 'raushandar', description: 'Раушан гүлдері' },
    { nameKz: 'Қызғалдақтар', slug: 'kyzgaldaktar', description: 'Қызғалдақтар' },
    { nameKz: 'Лалагүлдер', slug: 'lalagulder', description: 'Лалагүлдер' },
    { nameKz: 'Хризантемалар', slug: 'hrizantemalar', description: 'Хризантемалар' },
    { nameKz: 'Букеттер', slug: 'buketter', description: 'Әртүрлі букеттер' },
    { nameKz: 'Композициялар', slug: 'kompoziciyalar', description: 'Гүл композициялары' },
  ];
  for (const cat of categoriesData) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      create: cat,
      update: {},
    });
  }
  const categories = await prisma.category.findMany();

  // Tags
  const tagsData = [
    { nameKz: 'Сыйлыққа', slug: 'syilykka' },
    { nameKz: 'Тойға', slug: 'toyga' },
    { nameKz: 'Анама', slug: 'anama' },
    { nameKz: 'Жаңа жыл', slug: 'zhana-zhyl' },
    { nameKz: 'Махаббат', slug: 'mahabbat' },
    { nameKz: 'Алғыс', slug: 'algys' },
    { nameKz: 'Дәрігерге', slug: 'darigerge' },
    { nameKz: 'Қонақ үй', slug: 'konak-uy' },
  ];
  for (const t of tagsData) {
    await prisma.tag.upsert({
      where: { slug: t.slug },
      create: { nameKz: t.nameKz, slug: t.slug },
      update: {},
    });
  }
  const tags = await prisma.tag.findMany();

  // Colors
  for (const c of colorsData) {
    await prisma.color.upsert({
      where: { slug: c.slug },
      create: { nameKz: c.nameKz, slug: c.slug, hex: c.hex },
      update: {},
    });
  }
  const colors = await prisma.color.findMany();
  const colorBySlug = Object.fromEntries(colors.map((c) => [c.slug, c]));

  // Clear orders & products for fresh catalog
  await prisma.orderItem.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.productTag.deleteMany({});
  await prisma.productVariant.deleteMany({});
  await prisma.product.deleteMany({});
  console.log('Ескі деректер тазаланды');

  // Products with variants from catalog
  const products: { id: string }[] = [];
  let skuCounter = 1;

  for (let i = 0; i < catalogData.length; i++) {
    const item = catalogData[i];
    const category = categories.find((c) => c.slug === item.categorySlug) ?? categories[0];
    const productTags = tags.filter((t) => item.tagSlugs?.includes(t.slug));
    const slug = `${slugify(item.nameKz)}-${i + 1}`;

    const product = await prisma.product.create({
      data: {
        nameKz: item.nameKz,
        slug,
        description: `${item.nameKz} — сапалы таңдаулы гүлдер`,
        compositionKz: 'Таңдаулы жаңа гүлдер',
        imageUrl: imageUrls[i % imageUrls.length],
        categoryId: category.id,
        tags: {
          create: productTags.map((t) => ({ tagId: t.id })),
        },
      },
    });
    products.push(product);

    // Variants: map name to color where possible
    const colorSlugs: (string | null)[] = [];
    if (item.nameKz.includes('Қызыл қызғылт')) colorSlugs.push('kyzyl-kyzgylt');
    else if (item.nameKz.includes('Қызыл')) colorSlugs.push('kyzyl');
    else if (item.nameKz.includes('Ақ')) colorSlugs.push('aq');
    else if (item.nameKz.includes('Қызғылт')) colorSlugs.push('kyzgylt');
    else if (item.nameKz.includes('Сары')) colorSlugs.push('sary');
    else if (item.nameKz.includes('Қоңыр')) colorSlugs.push('kongyr');
    else if (item.nameKz.includes('Көк')) colorSlugs.push('kok');
    else if (item.nameKz.includes('Жасыл')) colorSlugs.push('zhasyl');
    else if (item.nameKz.includes('Аралас')) colorSlugs.push('aralys');
    else colorSlugs.push(null);

    const sizes = ['Кішкентай', 'Орташа', 'Үлкен'];
    for (let v = 0; v < item.prices.length; v++) {
      const price = item.prices[v];
      const colorSlug = colorSlugs[v % colorSlugs.length];
      const colorId = colorSlug ? colorBySlug[colorSlug]?.id : null;
      await prisma.productVariant.create({
        data: {
          productId: product.id,
          colorId,
          sizeKz: sizes[v] ?? null,
          price,
          stock: randomInt(50, 500),
          imageUrl: product.imageUrl,
          sku: `GV-${String(skuCounter++).padStart(4, '0')}`,
        },
      });
    }
  }
  console.log(`Products ${products.length} дайын`);

  // Admin
  const adminHash = await bcrypt.hash('Admin123!', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.kz' },
    create: {
      email: 'admin@example.kz',
      password: adminHash,
      fullName: 'Администратор',
      role: Role.ADMIN,
    },
    update: { password: adminHash },
  });
  console.log('Admin дайын');

  // Users
  const userCount = 1500;
  const allFirstNames = [...namesData.firstNamesMale, ...namesData.firstNamesFemale];
  const users: { id: string }[] = [];
  for (let i = 0; i < userCount; i++) {
    const firstName = randomChoice(allFirstNames);
    const lastName = randomChoice(namesData.lastNames);
    const fullName = `${firstName} ${lastName}`;
    const email = `user${i + 1}@example.kz`;
    const hash = await bcrypt.hash('User123!', 10);
    const u = await prisma.user.upsert({
      where: { email },
      create: {
        email,
        password: hash,
        fullName,
        phone: genPhone(),
        role: i === 0 ? Role.MANAGER : Role.USER,
      },
      update: { fullName, phone: genPhone(), role: i === 0 ? Role.MANAGER : Role.USER },
    });
    users.push(u);
  }
  console.log(`Users ${userCount} дайын`);

  // Orders with productVariantId
  const orderCount = 8000;
  const variantsByProduct = new Map<string, { id: string; price: number }[]>();

  for (const p of products) {
    const vars = await prisma.productVariant.findMany({
      where: { productId: p.id },
      select: { id: true, price: true },
    });
    variantsByProduct.set(p.id, vars);
  }

  for (let i = 0; i < orderCount; i++) {
    const user = randomChoice(users);
    const city = randomChoice(cities);
    const firstName = randomChoice(allFirstNames);
    const lastName = randomChoice(namesData.lastNames);
    const street = randomChoice(streetNames);
    const streetType = randomChoice(streetTypes);
    const address = `${street} ${streetType}, ${randomInt(1, 150)}-үй, ${randomInt(1, 100)} пәтер`;

    const itemCount = randomInt(1, 4);
    const selected: { productId: string; variantId: string; price: number }[] = [];
    for (let j = 0; j < itemCount; j++) {
      const p = randomChoice(products);
      const vars = variantsByProduct.get(p.id) ?? [];
      if (vars.length === 0) continue;
      const v = randomChoice(vars);
      selected.push({ productId: p.id, variantId: v.id, price: v.price });
    }
    const unique = Array.from(new Map(selected.map((s) => [s.variantId, s])).values());
    const subtotal = unique.reduce((s, sp) => s + sp.price * randomInt(1, 3), 0);
    const totalAmount = subtotal + city.deliveryFee;

    const daysAgo = randomInt(0, 90);
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - daysAgo);
    const deliveryTime = new Date(createdAt);
    deliveryTime.setDate(deliveryTime.getDate() + 1);

    const statuses: OrderStatus[] = ['NEW', 'PAID', 'PREPARING', 'DELIVERING', 'DELIVERED', 'CANCELLED'];
    const status = randomChoice(statuses);

    const order = await prisma.order.create({
      data: {
        userId: user.id,
        receiverName: `${firstName} ${lastName}`,
        receiverPhone: genPhone(),
        cityId: city.id,
        address,
        deliveryTime,
        cardMessage: 'Рақмет!',
        paymentMethod: randomChoice(['CASH', 'CARD_DEMO']),
        subtotal,
        deliveryFee: city.deliveryFee,
        totalAmount,
        status,
        createdAt,
        items: {
          create: unique.map((sp) => ({
            productId: sp.productId,
            productVariantId: sp.variantId,
            quantity: randomInt(1, 3),
            price: sp.price,
          })),
        },
      },
    });

    if (randomInt(0, 10) < 2) {
      await prisma.auditLog.create({
        data: {
          adminId: admin.id,
          adminEmail: admin.email,
          action: 'ORDER_CREATED',
          entityType: 'Order',
          entityId: order.id,
          newValue: { status: status as string },
          orderId: order.id,
          createdAt: order.createdAt,
        },
      });
    }
  }
  console.log(`Orders ${orderCount} дайын`);

  console.log('Seed аяқталды!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
