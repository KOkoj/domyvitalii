import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  try {
    // Create admin user
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@domyvitalii.cz';
    const adminPassword = process.env.ADMIN_PASSWORD || 'AdminPassword123!';
    const adminName = process.env.ADMIN_NAME || 'Admin User';

    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (!existingAdmin) {
      const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12');
      const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);

      const admin = await prisma.user.create({
        data: {
          email: adminEmail,
          password: hashedPassword,
          name: adminName,
          role: 'ADMIN',
          isActive: true,
        },
      });

      console.log(`✅ Admin user created: ${admin.email}`);
    } else {
      console.log(`ℹ️  Admin user already exists: ${adminEmail}`);
    }

    // Create sample settings
    const defaultSettings = [
      { key: 'site_name', value: 'Domy v Italii', type: 'STRING' },
      { key: 'site_description', value: 'Váš průvodce italskými nemovitostmi', type: 'STRING' },
      { key: 'contact_email', value: 'info@domyvitalii.cz', type: 'STRING' },
      { key: 'contact_phone', value: '+420 123 456 789', type: 'STRING' },
      { key: 'properties_per_page', value: '12', type: 'NUMBER' },
      { key: 'blog_posts_per_page', value: '10', type: 'NUMBER' },
      { key: 'enable_newsletter', value: 'true', type: 'BOOLEAN' },
      { key: 'maintenance_mode', value: 'false', type: 'BOOLEAN' },
    ];

    for (const setting of defaultSettings) {
      await prisma.setting.upsert({
        where: { key: setting.key },
        update: {},
        create: setting,
      });
    }

    console.log('✅ Default settings created');

    // Create sample property types and regions data
    const sampleProperties = [
      {
        title: 'Luxusní vila v Toskánsku',
        slug: 'luxusni-vila-v-toskansku',
        description: 'Krásná vila s výhledem na vinice v srdci Toskánska. Ideální pro ty, kdo hledají klid a krásu italské krajiny.',
        price: 85000000, // 850,000 EUR in cents
        type: 'VILLA',
        status: 'AVAILABLE',
        bedrooms: 4,
        bathrooms: 3,
        area: 280.5,
        lotSize: 5000,
        yearBuilt: 1890,
        features: JSON.stringify(['Bazén', 'Terasa', 'Vinice', 'Historická budova', 'Panoramatický výhled']),
        address: 'Via del Chianti 123',
        city: 'Greve in Chianti',
        region: 'Toskánsko',
        postalCode: '50022',
        country: 'Italy',
        metaTitle: 'Luxusní vila v Toskánsku - Domy v Italii',
        metaDescription: 'Objevte tuto nádhernou vilu v Toskánsku s výhledem na vinice. Ideální investice do italských nemovitostí.',
        isPublished: true,
        publishedAt: new Date(),
        authorId: '', // Will be set below
      },
      {
        title: 'Moderní apartmán v Římě',
        slug: 'moderni-apartman-v-rime',
        description: 'Stylový apartmán v centru Říma, blízko Kolosea. Perfektní pro městský život nebo jako investice do pronájmu.',
        price: 45000000, // 450,000 EUR in cents
        type: 'APARTMENT',
        status: 'AVAILABLE',
        bedrooms: 2,
        bathrooms: 2,
        area: 95,
        yearBuilt: 2020,
        features: JSON.stringify(['Klimatizace', 'Moderní kuchyň', 'Balkon', 'Výtah', 'Centrum města']),
        address: 'Via dei Fori Imperiali 45',
        city: 'Roma',
        region: 'Lazio',
        postalCode: '00184',
        country: 'Italy',
        metaTitle: 'Moderní apartmán v Římě - Domy v Italii',
        metaDescription: 'Stylový apartmán v centru Říma. Ideální pro bydlení nebo investici do pronájmu.',
        isPublished: true,
        publishedAt: new Date(),
        authorId: '', // Will be set below
      },
      {
        title: 'Historický dům v Benátkách',
        slug: 'historicky-dum-v-benatkach',
        description: 'Autentický benátský palazzetto s původními freskami a mramorovými podlahami. Unikátní příležitost vlastnit kus benátské historie.',
        price: 120000000, // 1,200,000 EUR
        type: 'HOUSE',
        status: 'SOLD',
        bedrooms: 3,
        bathrooms: 2,
        area: 180,
        yearBuilt: 1650,
        features: JSON.stringify(['Historické prvky', 'Fresky', 'Mramorové podlahy', 'Kanálový výhled', 'Terasa na střeše']),
        address: 'Calle del Paradiso 1234',
        city: 'Venezia',
        region: 'Veneto',
        postalCode: '30121',
        country: 'Italy',
        metaTitle: 'Historický palazzetto v Benátkách - Domy v Italii',
        metaDescription: 'Autentický benátský dům s původními freskami. Unikátní investice do historické nemovitosti.',
        isPublished: true,
        publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
        authorId: '',
      },
      {
        title: 'Farmhouse s olivovým hájem na Sicílii',
        slug: 'farmhouse-s-olivovym-hajem-na-sicilii',
        description: 'Renovovaný sicilský farmhouse obklopený olivovými háji s výhledem na Etnu. Ideální pro klidný život v přírodě.',
        price: 32000000, // 320,000 EUR
        type: 'FARMHOUSE',
        status: 'AVAILABLE',
        bedrooms: 5,
        bathrooms: 3,
        area: 220,
        lotSize: 8000,
        yearBuilt: 1920,
        features: JSON.stringify(['Olivový háj', 'Výhled na Etnu', 'Kamenná stavba', 'Venkovní kuchyň', 'Bazén']),
        address: 'Contrada Monte Rosso 45',
        city: 'Taormina',
        region: 'Sicílie',
        postalCode: '98039',
        country: 'Italy',
        metaTitle: 'Sicilský farmhouse s olivovým hájem - Domy v Italii',
        metaDescription: 'Renovovaný farmhouse na Sicílii s olivovým hájem a výhledem na Etnu.',
        isPublished: true,
        publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        authorId: '',
      },
      {
        title: 'Luxusní pentouse v Miláně',
        slug: 'luxusni-pentouse-v-milane',
        description: 'Moderní pentouse s panoramatickým výhledem na Milán. Designérské vybavení a přístup na soukromou terasu.',
        price: 180000000, // 1,800,000 EUR
        type: 'APARTMENT',
        status: 'AVAILABLE',
        bedrooms: 4,
        bathrooms: 4,
        area: 250,
        yearBuilt: 2019,
        features: JSON.stringify(['Panoramatický výhled', 'Soukromá terasa', 'Designérské vybavení', 'Klimatizace', 'Concierge']),
        address: 'Corso Buenos Aires 123',
        city: 'Milano',
        region: 'Lombardia',
        postalCode: '20124',
        country: 'Italy',
        metaTitle: 'Luxusní pentouse v Miláně - Domy v Italii',
        metaDescription: 'Exkluzivní pentouse s panoramatickým výhledem na Milán. Luxusní bydlení v srdci města.',
        isPublished: true,
        publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        authorId: '',
      },
      {
        title: 'Apartmán u moře v Cinque Terre',
        slug: 'apartman-u-more-v-cinque-terre',
        description: 'Útulný apartmán s výhledem na Ligurské moře v jedné z nejkrásnějších částí Itálie.',
        price: 55000000, // 550,000 EUR
        type: 'APARTMENT',
        status: 'DRAFT',
        bedrooms: 2,
        bathrooms: 1,
        area: 75,
        yearBuilt: 1960,
        features: JSON.stringify(['Výhled na moře', 'Balkon', 'Blízko pláže', 'Turistická oblast']),
        address: 'Via del Mare 78',
        city: 'Monterosso al Mare',
        region: 'Liguria',
        postalCode: '19016',
        country: 'Italy',
        metaTitle: 'Apartmán u moře v Cinque Terre - Domy v Italii',
        metaDescription: 'Útulný apartmán s výhledem na moře v Cinque Terre.',
        isPublished: false,
        publishedAt: null,
        authorId: '',
      },
      {
        title: 'Castello v Umbrii',
        slug: 'castello-v-umbrii',
        description: 'Středověký hrad s vlastním vinicí a olivovým hájem. Unikátní příležitost pro ty, kdo sní o vlastním hradu.',
        price: 350000000, // 3,500,000 EUR
        type: 'CASTLE',
        status: 'AVAILABLE',
        bedrooms: 12,
        bathrooms: 8,
        area: 800,
        lotSize: 50000,
        yearBuilt: 1200,
        features: JSON.stringify(['Historický hrad', 'Vinice', 'Olivový háj', 'Kaple', 'Hradní park']),
        address: 'Loc. Castello 1',
        city: 'Todi',
        region: 'Umbria',
        postalCode: '06059',
        country: 'Italy',
        metaTitle: 'Středověký hrad v Umbrii - Domy v Italii',
        metaDescription: 'Autentický středověký hrad s vinicí a olivovým hájem v srdci Umbrie.',
        isPublished: true,
        publishedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 2 weeks ago
        authorId: '',
      },
      {
        title: 'Moderna vila u jezera Como',
        slug: 'moderna-vila-u-jezera-como',
        description: 'Architektonicky výjimečná vila s přímým přístupem k jezeru Como. Ideální kombinace moderního designu a přírodní krásy.',
        price: 280000000, // 2,800,000 EUR
        type: 'VILLA',
        status: 'RENTED',
        bedrooms: 6,
        bathrooms: 5,
        area: 400,
        lotSize: 2000,
        yearBuilt: 2021,
        features: JSON.stringify(['Přístup k jezeru', 'Moderní architektura', 'Nekonečný bazén', 'Spa', 'Garáž pro 3 auta']),
        address: 'Via Regina 456',
        city: 'Bellagio',
        region: 'Lombardia',
        postalCode: '22021',
        country: 'Italy',
        metaTitle: 'Moderní vila u jezera Como - Domy v Italii',
        metaDescription: 'Architektonicky výjimečná vila s přímým přístupem k jezeru Como.',
        isPublished: true,
        publishedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 1 month ago
        authorId: '',
      }
    ];

    // Get admin user ID for properties
    const adminUser = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (adminUser) {
      for (const propertyData of sampleProperties) {
        propertyData.authorId = adminUser.id;
        
        const existingProperty = await prisma.property.findUnique({
          where: { slug: propertyData.slug },
        });

        if (!existingProperty) {
          await prisma.property.create({
            data: propertyData,
          });
          console.log(`✅ Sample property created: ${propertyData.title}`);
        }
      }
    }

    // Create sample blog posts
    const sampleBlogPosts = [
      {
        title: 'Průvodce nákupem nemovitosti v Italii',
        slug: 'pruvodce-nakupem-nemovitosti-v-italii',
        excerpt: 'Vše, co potřebujete vědět o koupi nemovitosti v Italii. Od právních náležitostí po daňové povinnosti.',
        content: `
          <h2>Úvod do nákupu nemovitostí v Italii</h2>
          <p>Itálie je jednou z nejoblíbenějších destinací pro nákup nemovitostí v Evropě. Kombinuje krásnou krajinu, bohatou kulturu a relativně dostupné ceny nemovitostí.</p>
          
          <h3>Právní náležitosti</h3>
          <p>Před nákupem nemovitosti v Italii je důležité pochopit místní právní systém a požadavky...</p>
          
          <h3>Daňové povinnosti</h3>
          <p>Kupující musí počítat s různými daněmi a poplatky, včetně daně z převodu nemovitosti...</p>
          
          <h3>Financování</h3>
          <p>Možnosti financování pro zahraniční kupce se v posledních letech zlepšily...</p>
        `,
        family: 'PROPERTY',
        topic: 'Právo',
        tags: JSON.stringify(['nákup', 'právní náležitosti', 'daně', 'financování']),
        readTime: 8,
        metaTitle: 'Průvodce nákupem nemovitosti v Italii - Domy v Italii',
        metaDescription: 'Kompletní průvodce nákupem nemovitosti v Italii. Právní náležitosti, daně a praktické rady.',
        isPublished: true,
        publishedAt: new Date(),
        authorId: '', // Will be set below
      },
      {
        title: 'Toskánsko: Srdce italské kultury',
        slug: 'toskansko-srdce-italske-kultury',
        excerpt: 'Objevte krásy Toskánska - regionu, který ztělesňuje to nejlepší z italské kultury, gastronomie a krajiny.',
        content: `
          <h2>Proč je Toskánsko tak výjimečné?</h2>
          <p>Toskánsko není jen region - je to symbol italského životního stylu. Zde se rodilo renesanční umění a zde dodnes žije tradice...</p>
          
          <h3>Města a památky</h3>
          <p>Florencie, Siena, Pisa - každé město má svou jedinečnou atmosféru a historii...</p>
          
          <h3>Gastronomie</h3>
          <p>Toskánská kuchyně je založena na jednoduchých, ale kvalitních surovinách...</p>
        `,
        family: 'TRIVIA',
        topic: 'Kultura',
        tags: JSON.stringify(['Toskánsko', 'kultura', 'historie', 'gastronomie']),
        readTime: 6,
        metaTitle: 'Toskánsko: Srdce italské kultury - Domy v Italii',
        metaDescription: 'Objevte krásy Toskánska a jeho bohatou kulturu. Průvodce regionem plným historie a tradice.',
        isPublished: true,
        publishedAt: new Date(),
        authorId: '', // Will be set below
      },
      {
        title: 'Top 10 italských měst pro investice do nemovitostí',
        slug: 'top-10-italskych-mest-pro-investice-do-nemovitosti',
        excerpt: 'Analýza nejlepších italských měst pro investice do nemovitostí v roce 2024. Potenciál růstu a návratnost investic.',
        content: `
          <h2>Nejlepší města pro investice</h2>
          <p>Itálie nabízí rozmanité příležitosti pro investice do nemovitostí. Zde je náš výběr top 10 měst...</p>
          
          <h3>1. Milán - Ekonomické centrum</h3>
          <p>Milán zůstává nejsilnějším trhem s nemovitostmi v Itálii...</p>
          
          <h3>2. Řím - Věčné město</h3>
          <p>Hlavní město nabízí stabilní trh s vysokou poptávkou...</p>
        `,
        family: 'PROPERTY',
        topic: 'Investice',
        tags: JSON.stringify(['investice', 'města', 'analýza trhu', 'návratnost']),
        readTime: 12,
        metaTitle: 'Top 10 italských měst pro investice do nemovitostí - Domy v Italii',
        metaDescription: 'Nejlepší italská města pro investice do nemovitostí v roce 2024. Analýza a doporučení.',
        isPublished: true,
        publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        authorId: '',
      },
      {
        title: 'Italská gastronomie: Cesta regionálními specialitami',
        slug: 'italska-gastronomie-cesta-regionalnimi-specialitami',
        excerpt: 'Objevte bohatou rozmanitost italské kuchyně - od severu až po jih, každý region má své jedinečné chutě.',
        content: `
          <h2>Rozmanitost italské kuchyně</h2>
          <p>Itálie není jen pizza a špagety. Každý region má svou unikátní gastronomickou tradici...</p>
          
          <h3>Severní Itálie</h3>
          <p>Risotto, polenta a výborná vína z Piemontu a Veneta...</p>
          
          <h3>Střední Itálie</h3>
          <p>Toskánské steaky, umbrijské lanýže a lazijská carbonara...</p>
        `,
        family: 'TRIVIA',
        topic: 'Gastronomie',
        tags: JSON.stringify(['gastronomie', 'regionální kuchyně', 'víno', 'tradice']),
        readTime: 10,
        metaTitle: 'Italská gastronomie: Regionální speciality - Domy v Italii',
        metaDescription: 'Průvodce italskou gastronomií po regionech. Objevte autentické chutě Itálie.',
        isPublished: true,
        publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        authorId: '',
      },
      {
        title: 'Benátky: Život ve městě na vodě',
        slug: 'benatky-zivot-ve-meste-na-vode',
        excerpt: 'Jak je to žít v Benátkách? Praktické informace o každodenním životě v nejromantičtějším městě světa.',
        content: `
          <h2>Každodenní život v Benátkách</h2>
          <p>Benátky nejsou jen turistická destinace - je to skutečné město s obyvateli, kteří zde žijí každý den...</p>
          
          <h3>Doprava</h3>
          <p>Vaporetto, gondoly a chůze - jak se pohybovat po městě bez aut...</p>
        `,
        family: 'TRIVIA',
        topic: 'Životní styl',
        tags: JSON.stringify(['Benátky', 'životní styl', 'každodenní život', 'doprava']),
        readTime: 7,
        metaTitle: 'Život v Benátkách - Domy v Italii',
        metaDescription: 'Jak se žije v Benátkách? Praktické informace o životě ve městě na vodě.',
        isPublished: false, // Draft
        publishedAt: null,
        authorId: '',
      },
      {
        title: 'Renovace italských nemovitostí: Co vás čeká',
        slug: 'renovace-italskych-nemovitosti-co-vas-ceka',
        excerpt: 'Praktický průvodce renovací starých italských nemovitostí. Povolení, náklady a časté problémy.',
        content: `
          <h2>Renovace v Itálii</h2>
          <p>Renovace historických nemovitostí v Itálii může být výzvou, ale výsledek stojí za to...</p>
          
          <h3>Povolení a byrokratické náležitosti</h3>
          <p>Jaká povolení potřebujete a jak je získat...</p>
        `,
        family: 'PROPERTY',
        topic: 'Renovace',
        tags: JSON.stringify(['renovace', 'povolení', 'náklady', 'historické budovy']),
        readTime: 15,
        metaTitle: 'Renovace italských nemovitostí - Domy v Italii',
        metaDescription: 'Praktický průvodce renovací italských nemovitostí. Povolení, náklady a tipy.',
        isPublished: true,
        publishedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        authorId: '',
      },
      {
        title: 'Nejkrásnější italská jezera a jejich nemovitosti',
        slug: 'nejkrasnejsi-italska-jezera-a-jejich-nemovitosti',
        excerpt: 'Průvodce nemovitostmi u italských jezer - Como, Garda, Maggiore. Ceny, lokality a investiční potenciál.',
        content: `
          <h2>Italská jezera</h2>
          <p>Severoitalská jezera patří k nejkrásnějším místům Evropy a jejich nemovitosti jsou velmi žádané...</p>
          
          <h3>Jezero Como</h3>
          <p>Nejprestižnější z italských jezer s vysokými cenami nemovitostí...</p>
        `,
        family: 'PROPERTY',
        topic: 'Lokality',
        tags: JSON.stringify(['jezera', 'Como', 'Garda', 'luxusní nemovitosti']),
        readTime: 9,
        metaTitle: 'Nemovitosti u italských jezer - Domy v Italii',
        metaDescription: 'Průvodce nemovitostmi u italských jezer Como, Garda a Maggiore.',
        isPublished: true,
        publishedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
        authorId: '',
      },
      {
        title: 'Daňové výhody při koupi nemovitosti v Itálii',
        slug: 'danove-vyhody-pri-koupi-nemovitosti-v-italii',
        excerpt: 'Přehled daňových úlev a výhod pro zahraniční kupce italských nemovitostí v roce 2024.',
        content: `
          <h2>Aktuální daňové úlevy</h2>
          <p>Italská vláda nabízí různé daňové výhody pro podporu investic do nemovitostí...</p>
        `,
        family: 'PROPERTY',
        topic: 'Právo',
        tags: JSON.stringify(['daně', 'výhody', 'úlevy', 'legislativa']),
        readTime: 6,
        metaTitle: 'Daňové výhody při koupi nemovitosti v Itálii - Domy v Italii',
        metaDescription: 'Aktuální přehled daňových výhod a úlev pro kupce italských nemovitostí.',
        isPublished: false, // Draft
        publishedAt: null,
        authorId: '',
      }
    ];

    if (adminUser) {
      for (const postData of sampleBlogPosts) {
        postData.authorId = adminUser.id;
        
        const existingPost = await prisma.blogPost.findUnique({
          where: { slug: postData.slug },
        });

        if (!existingPost) {
          await prisma.blogPost.create({
            data: postData,
          });
          console.log(`✅ Sample blog post created: ${postData.title}`);
        }
      }
    }

    // Create sample inquiries
    const sampleInquiries = [
      {
        name: 'Jan Novák',
        email: 'jan.novak@email.cz',
        phone: '+420 606 123 456',
        message: 'Zdravím, zajímá mě vila v Toskánsku. Mohli byste mi poslat více informací o možnostech financování a návštěvy nemovitosti? Děkuji.',
        type: 'PROPERTY',
        status: 'NEW',
        source: 'website',
        createdAt: new Date(),
      },
      {
        name: 'Marie Svobodová',
        email: 'marie.svobodova@seznam.cz',
        phone: '+420 777 987 654',
        message: 'Dobrý den, hledám apartmán v Římě do 500 000 EUR. Máte něco vhodného? Preferuji centrum města.',
        type: 'PROPERTY',
        status: 'IN_PROGRESS',
        source: 'google',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      },
      {
        name: 'Petr Dvořák',
        email: 'petr.dvorak@gmail.com',
        phone: '+420 602 345 678',
        message: 'Zajímám se o investiční příležitosti v severní Itálii. Můžete mi doporučit nějaké lokality s dobrým potenciálem?',
        type: 'GENERAL',
        status: 'RESPONDED',
        source: 'facebook',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      },
      {
        name: 'Anna Nováková',
        email: 'anna.novakova@email.cz',
        phone: '+420 608 876 543',
        message: 'Zdravím, ráda bych se dozvěděla více o procesu koupě nemovitosti v Itálii pro české občany. Jaké jsou právní náležitosti?',
        type: 'GENERAL',
        status: 'NEW',
        source: 'newsletter',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      },
      {
        name: 'Tomáš Černý',
        email: 'tomas.cerny@firma.cz',
        phone: '+420 605 234 567',
        message: 'Dobrý den, představuji firmu specializující se na luxusní nemovitosti. Zajímá nás spolupráce při prodeji high-end nemovitostí.',
        type: 'GENERAL',
        status: 'CLOSED',
        source: 'linkedin',
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 2 weeks ago
      },
      {
        name: 'Katarína Horváthová',
        email: 'katarina.horvathova@email.sk',
        phone: '+421 905 123 456',
        message: 'Ahoj, hľadám dom v Toskánsku pre rodinu s deťmi. Potrebujem záhradu a blízko školy. Môj budget je do 800 000 EUR.',
        type: 'PROPERTY',
        status: 'IN_PROGRESS',
        source: 'website',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      },
      {
        name: 'Robert Wagner',
        email: 'robert.wagner@email.de',
        phone: '+49 171 234 5678',
        message: 'Guten Tag, ich interessiere mich für eine Villa am Comer See. Können Sie mir weitere Informationen zusenden?',
        type: 'PROPERTY',
        status: 'NEW',
        source: 'google',
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      }
    ];

    // Create sample inquiries
    for (const inquiryData of sampleInquiries) {
      await prisma.inquiry.create({
        data: inquiryData,
      });
    }
    console.log('✅ Sample inquiries created');

    // Create sample newsletter subscribers
    const sampleSubscribers = [
      {
        email: 'pavel.novak@email.cz',
        name: 'Pavel Novák',
        isActive: true,
        source: 'website',
        preferences: JSON.stringify(['properties', 'investment-tips']),
      },
      {
        email: 'lucie.svobodova@seznam.cz',
        name: 'Lucie Svobodová',
        isActive: true,
        source: 'blog',
        preferences: JSON.stringify(['travel', 'culture']),
      },
      {
        email: 'martin.dvorak@gmail.com',
        name: 'Martin Dvořák',
        isActive: false,
        source: 'social-media',
        preferences: JSON.stringify(['properties']),
      }
    ];

    for (const subscriberData of sampleSubscribers) {
      await prisma.newsletterSubscriber.upsert({
        where: { email: subscriberData.email },
        update: subscriberData,
        create: subscriberData,
      });
    }
    console.log('✅ Sample newsletter subscribers created');

    console.log('🎉 Database seed completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`   Admin Email: ${adminEmail}`);
    console.log(`   Admin Password: ${adminPassword}`);
    console.log('   8 sample properties created (mix of available, sold, draft, rented)');
    console.log('   8 sample blog posts created (mix of published and draft)');
    console.log('   7 sample inquiries created');
    console.log('   3 sample newsletter subscribers created');
    console.log('   Default settings configured');

  } catch (error) {
    console.error('❌ Error during database seed:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 