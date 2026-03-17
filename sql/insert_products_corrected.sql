-- Insert SpaceCraft Products (9 products)
-- First, ensure all required categories and brands exist

-- Insert missing categories
INSERT INTO categories (name, slug) VALUES
('Sofa Cum Beds', 'sofa-cum-beds'),
('Lazy Chairs', 'lazy-chairs'),
('Study Tables', 'study-tables'),
('Metal Cots', 'metal-cots'),
('Bunk Beds', 'bunk-beds'),
('Rocking Chairs', 'rocking-chairs')
ON CONFLICT (slug) DO NOTHING;

-- Insert SpaceCraft brand if it doesn't exist
INSERT INTO brands (name, slug) VALUES
('SpaceCraft', 'spacecraft')
ON CONFLICT (slug) DO NOTHING;

-- Then insert product images using separate INSERT statements

-- Product 1: Nova Sofa Bed Without Storage
INSERT INTO products (
  name, slug, category_id, brand_id, description, price, discount_price, 
  stock, material, dimensions, tags
) VALUES (
  'Nova Sofa Bed Without Storage',
  'nova-sofa-bed-without-storage',
  (SELECT id FROM categories WHERE slug = 'sofa-cum-beds'),
  (SELECT id FROM brands WHERE slug = 'spacecraft'),
  'The Nova sofa bed without storage is a versatile piece of living room furniture that exemplifies functionality, space-saving design, and multipurpose usage. It serves as a stylish sofa during the day and effortlessly converts into a comfortable bed at night, making it ideal for small apartments, guest rooms, or any space-conscious environment.

Designed with modern living in mind, the Nova sofa bed without storage features a sleek and minimalist aesthetic. It typically boasts clean lines and a compact silhouette, making it suitable for various interior styles from contemporary to Scandinavian. The absence of storage compartments ensures a streamlined appearance, perfect for those prioritizing simplicity and elegance in their living spaces.

The sofa configuration of the Nova sofa bed provides a comfortable seating experience. It is often upholstered in durable fabrics or leatherette, offering both style and practicality. The seating cushions are designed to provide adequate support and comfort for everyday use, whether relaxing with family or entertaining guests.

When needed as a bed, the Nova sofa bed transforms quickly and easily. The mechanism varies but typically involves a simple pull-out or fold-down feature that converts the sofa into a spacious sleeping area. This makes it convenient for hosting overnight guests or accommodating family members, ensuring they have a comfortable place to sleep without the need for a separate guest bed.

The construction of the Nova sofa bed without storage focuses on durability and stability. It often includes a sturdy frame made from materials such as hardwood or metal, ensuring long-lasting performance. The mattress or sleeping surface is designed to provide adequate support for a restful night''s sleep, catering to the needs of both occasional and regular use.

In terms of aesthetic versatility, the Nova sofa bed without storage is available in a range of colors and finishes to complement different décor preferences. Whether placed in a small urban apartment or a cozy guest room, homeowners can choose a design that harmonizes with existing furniture and enhances the overall ambiance of their living space.

Overall, the Nova sofa bed without storage offers a practical solution for maximizing space in living rooms while providing versatile functionality. Its ability to seamlessly transition between sofa and bed configurations makes it a valuable addition to any home seeking to optimize space without compromising on comfort or style. With its modern design, durable construction, and multipurpose usage, the Nova sofa bed without storage ensures both practicality and aesthetic appeal in contemporary living environments.',
  30000,
  21186,
  10,
  'Fabric Upholstery, Hardwood & Metal Frame',
  '{"length": 1.9, "width": 0.9, "height": 0.85}',
  array['sofa-bed', 'space-saving', 'living-room', 'fabric', 'multipurpose']
);

-- Insert images for Nova Sofa Bed
INSERT INTO product_images (product_id, url, alt, position) 
VALUES 
  ((SELECT id FROM products WHERE slug = 'nova-sofa-bed-without-storage'), 'https://oduvaeykaeabnpmyliut.supabase.co/storage/v1/object/public/spacecraftsdigital/products/nova-sofa-bed-without-storage-1.jpg', 'Nova Sofa Bed Without Storage - front view', 0),
  ((SELECT id FROM products WHERE slug = 'nova-sofa-bed-without-storage'), 'https://oduvaeykaeabnpmyliut.supabase.co/storage/v1/object/public/spacecraftsdigital/products/nova-sofa-bed-without-storage-2.jpg', 'Nova Sofa Bed Without Storage - side view', 1),
  ((SELECT id FROM products WHERE slug = 'nova-sofa-bed-without-storage'), 'https://oduvaeykaeabnpmyliut.supabase.co/storage/v1/object/public/spacecraftsdigital/products/nova-sofa-bed-without-storage-3.jpg', 'Nova Sofa Bed Without Storage - detail view', 2);

-- Product 2: Voyager NEC Chair
INSERT INTO products (
  name, slug, category_id, brand_id, description, price, discount_price, 
  stock, material, dimensions, tags
) VALUES (
  'Voyager NEC Chair',
  'voyager-nec-chair',
  (SELECT id FROM categories WHERE slug = 'lazy-chairs'),
  (SELECT id FROM brands WHERE slug = 'spacecraft'),
  'The Voyager NEC Chair is a versatile and stylish addition to any home or office space, designed with the modern user in mind. This folding chair excels in providing both comfort and practicality, making it an excellent choice for those who appreciate both style and functionality in their furniture.

Crafted with a robust frame and high-quality materials, the Voyager NEC Chair stands out as a reliable and durable option for various uses. Its foldable design ensures easy storage and transport, making it a space-saving marvel for any environment. Whether you need extra seating for guests, a convenient chair for your study area, or a comfortable seat for relaxation, this chair is designed to meet your needs.

The chair''s folding mechanism allows it to be effortlessly collapsed and stored away when not in use, thus optimizing space in your living area. This feature is particularly beneficial in smaller homes, apartments, or offices where every inch of space counts. When unfolded, the Voyager NEC Chair offers ample seating space and a sturdy construction, ensuring that you can sit comfortably for extended periods.

In addition to its functional design, the Voyager NEC Chair boasts an aesthetically pleasing appearance. Its sleek lines and contemporary design make it a stylish addition to any décor, seamlessly blending with both modern and traditional interiors. The chair''s cushioned seat and backrest are designed for maximum comfort, providing a supportive and relaxing seating experience.

One of the key features of the Voyager NEC Chair is its versatility. It can be used in a variety of settings, including as a lazy chair for casual lounging, an extra chair for gatherings, or a functional seating solution for workspaces. Its adaptability makes it a practical choice for any situation, whether you''re hosting a party, setting up a temporary workspace, or simply enjoying some downtime.

The space-saving attributes of this chair make it a valuable asset for those who frequently rearrange their living spaces or require additional seating without permanent installation. Its foldable nature ensures that it can be tucked away neatly when not needed, freeing up valuable space for other activities.

Overall, the Voyager NEC Chair combines functionality, comfort, and style in one compact, foldable design. Its space-saving features, coupled with its durable construction and sleek look, make it an ideal choice for anyone looking to enhance their seating options without compromising on style or space.',
  5000,
  3500,
  10,
  'Powder-Coated Metal Frame, Cushioned Fabric Seat',
  '{"length": 0.65, "width": 0.6, "height": 0.95}',
  array['lazy-chair', 'folding-chair', 'space-saving', 'seating']
);

INSERT INTO product_images (product_id, url, alt, position) 
VALUES 
  ((SELECT id FROM products WHERE slug = 'voyager-nec-chair'), 'https://oduvaeykaeabnpmyliut.supabase.co/storage/v1/object/public/spacecraftsdigital/products/voyager-nec-chair-1.jpg', 'Voyager NEC Chair - front view', 0),
  ((SELECT id FROM products WHERE slug = 'voyager-nec-chair'), 'https://oduvaeykaeabnpmyliut.supabase.co/storage/v1/object/public/spacecraftsdigital/products/voyager-nec-chair-2.jpg', 'Voyager NEC Chair - side view', 1),
  ((SELECT id FROM products WHERE slug = 'voyager-nec-chair'), 'https://oduvaeykaeabnpmyliut.supabase.co/storage/v1/object/public/spacecraftsdigital/products/voyager-nec-chair-3.jpg', 'Voyager NEC Chair - folded view', 2);

-- Product 3: Halley Sofa Cum Bed Single
INSERT INTO products (
  name, slug, category_id, brand_id, description, price, discount_price, 
  stock, material, dimensions, tags
) VALUES (
  'Halley Sofa Cum Bed Single',
  'halley-sofa-cum-bed-single',
  (SELECT id FROM categories WHERE slug = 'sofa-cum-beds'),
  (SELECT id FROM brands WHERE slug = 'spacecraft'),
  'The Halley sofa cum bed single exemplifies modern living room furniture designed for space efficiency and multipurpose functionality. Ideal for small apartments, guest rooms, or any space-conscious environment, it seamlessly transforms from a stylish sofa into a comfortable bed, offering dual functionality without compromising on comfort or style.

As a sofa, the Halley blends contemporary design with practicality. It features a sleek and minimalist aesthetic, often upholstered in premium fabrics or leatherette for a luxurious feel. The clean lines and compact dimensions make it suitable for various living room layouts, adding a touch of elegance to any décor scheme. Its versatility allows it to serve as a cozy seating option during the day, perfect for relaxing or entertaining guests.

When evening arrives or when an extra sleeping surface is needed, the Halley effortlessly converts into a bed. The mechanism is typically user-friendly, allowing for quick transformation without the need for extensive setup. This makes it an ideal solution for accommodating overnight guests or for creating a comfortable sleeping area in smaller living spaces where a traditional bed might not fit.

The sofa cum bed design of the Halley incorporates thoughtful features to enhance functionality. Some models may include storage compartments underneath the seating area, providing additional space for pillows, blankets, or other items. This not only maximizes storage capacity but also contributes to maintaining a clutter-free living environment.

In terms of construction, the Halley sofa cum bed single is built to prioritize durability and comfort. It often includes a sturdy frame made from materials like hardwood or metal, ensuring stability and longevity. The mattress or seating cushions are designed for optimal support and resilience, offering a restful sleep or comfortable seating experience over time.

The versatility of the Halley sofa cum bed single extends beyond its functional aspects to its aesthetic appeal. Available in a variety of colors and finishes, it can be customized to complement different interior styles and personal preferences. Whether enhancing a modern living room with a sleek finish or blending into a more classic décor with a neutral tone, the Halley adapts seamlessly to its surroundings.

Overall, the Halley sofa cum bed single represents a smart choice for individuals or families seeking versatile living room furniture that maximizes space and functionality. Its ability to transform effortlessly between a sofa and a bed makes it a practical investment for optimizing living spaces without sacrificing comfort or style.',
  11700,
  8305,
  10,
  'Fabric Upholstery, Hardwood & Metal Frame',
  '{"length": 1.8, "width": 0.85, "height": 0.8}',
  array['sofa-bed', 'single', 'space-saving', 'guest-room']
);

INSERT INTO product_images (product_id, url, alt, position) 
VALUES 
  ((SELECT id FROM products WHERE slug = 'halley-sofa-cum-bed-single'), 'https://oduvaeykaeabnpmyliut.supabase.co/storage/v1/object/public/spacecraftsdigital/products/halley-sofa-cum-bed-single-1.jpg', 'Halley Sofa Cum Bed Single - front view', 0),
  ((SELECT id FROM products WHERE slug = 'halley-sofa-cum-bed-single'), 'https://oduvaeykaeabnpmyliut.supabase.co/storage/v1/object/public/spacecraftsdigital/products/halley-sofa-cum-bed-single-2.jpg', 'Halley Sofa Cum Bed Single - converted to bed', 1),
  ((SELECT id FROM products WHERE slug = 'halley-sofa-cum-bed-single'), 'https://oduvaeykaeabnpmyliut.supabase.co/storage/v1/object/public/spacecraftsdigital/products/halley-sofa-cum-bed-single-3.jpg', 'Halley Sofa Cum Bed Single - detail view', 2);

-- Product 4: Proton Study Desk
INSERT INTO products (
  name, slug, category_id, brand_id, description, price, discount_price, 
  stock, material, dimensions, tags
) VALUES (
  'Proton Study Desk',
  'proton-study-desk',
  (SELECT id FROM categories WHERE slug = 'study-tables'),
  (SELECT id FROM brands WHERE slug = 'spacecraft'),
  'The Proton Study Desk is a highly functional and stylish addition to any student''s study area or home office. Combining modern design with practical features, this study desk stands out as a quintessential piece of space-saving furniture, specifically designed to enhance productivity and organization in any environment.

At its core, the Proton Study Desk is crafted to cater to the needs of students and professionals alike, offering a spacious work surface that provides ample room for a laptop, books, and writing materials. The desk''s clean lines and minimalist design ensure it blends seamlessly into any room decor, making it a versatile choice for both contemporary and traditional settings.

One of the key features of the Proton Study Desk is its space-saving design. Unlike traditional desks that can dominate a room, this study table is engineered to maximize functionality without occupying excessive floor space. It includes smart storage solutions such as built-in shelves and drawers, which are perfect for organizing stationery, notebooks, and other essentials. This efficient use of space helps keep the work area clutter-free, allowing for better focus and productivity.

The desk''s robust construction ensures durability and stability. Made from high-quality materials, it is built to withstand the rigors of daily use while maintaining its elegant appearance. It is also designed with ergonomic considerations in mind, offering a comfortable workspace that promotes good posture and reduces strain during long study sessions.

For those who value versatility, It offers additional features that enhance its functionality. The desk''s surface can accommodate various study aids, including a desk lamp and personal organizer, while its compact design ensures that it does not overwhelm smaller spaces. Whether used as a student study table or as a home office desk, it adapts well to different requirements.

Moreover, the Proton Study Desk is straightforward to assemble, with clear instructions provided to ensure a hassle-free setup process. Its design incorporates user-friendly elements, making it accessible for individuals of all ages.

In summary, the Proton Study Desk is an exemplary piece of space-saving furniture that meets the needs of modern students and professionals. With its blend of practicality, durability, and elegant design, it provides a functional and aesthetically pleasing workspace that enhances productivity and organization in any study or work environment.',
  7600,
  5400,
  10,
  'Engineered Wood with Laminate Finish',
  '{"length": 1.2, "width": 0.6, "height": 0.75}',
  array['study-table', 'desk', 'engineered-wood', 'home-office']
);

INSERT INTO product_images (product_id, url, alt, position) 
VALUES 
  ((SELECT id FROM products WHERE slug = 'proton-study-desk'), 'https://oduvaeykaeabnpmyliut.supabase.co/storage/v1/object/public/spacecraftsdigital/products/proton-study-desk-1.jpg', 'Proton Study Desk - front view', 0),
  ((SELECT id FROM products WHERE slug = 'proton-study-desk'), 'https://oduvaeykaeabnpmyliut.supabase.co/storage/v1/object/public/spacecraftsdigital/products/proton-study-desk-2.jpg', 'Proton Study Desk - side angle with storage', 1),
  ((SELECT id FROM products WHERE slug = 'proton-study-desk'), 'https://oduvaeykaeabnpmyliut.supabase.co/storage/v1/object/public/spacecraftsdigital/products/proton-study-desk-3.jpg', 'Proton Study Desk - detail view', 2);

-- Product 5: Jupiter Bunk Cum Futon Cot
INSERT INTO products (
  name, slug, category_id, brand_id, description, price, discount_price, 
  stock, material, dimensions, tags
) VALUES (
  'Jupiter Bunk Cum Futon Cot',
  'jupiter-bunk-cum-futon-cot',
  (SELECT id FROM categories WHERE slug = 'bunk-beds'),
  (SELECT id FROM brands WHERE slug = 'spacecraft'),
  'The Jupiter Bunk Cum Futon Cot is an innovative piece of living room furniture that exemplifies space-saving and multipurpose functionality. Designed to maximize living space efficiency, this versatile furniture item combines a bunk bed with a futon, offering dual functionality for seating and sleeping arrangements.

In today''s compact living environments, where optimizing space is crucial, It serves as a practical solution. It efficiently transforms from a comfortable seating area during the day into a cozy sleeping space at night. This multipurpose design is ideal for studio apartments, small living rooms, or any space where versatility is key.

The bunk bed feature of this Cot ensures efficient use of vertical space. It typically comprises a sturdy steel frame that supports two twin-sized beds stacked one above the other. This configuration allows for accommodating two sleepers without occupying additional floor space, making it ideal for children''s rooms or guest accommodations.

Moreover, the futon component adds further versatility to the Jupiter Bunk Cum Futon Cot. Positioned below the upper bunk, the futon serves as a comfortable sofa during the day. It can be easily converted into a bed at night, providing an additional sleeping surface when needed. This dual-purpose functionality makes the cot suitable for hosting guests or accommodating varying household needs without requiring separate furniture pieces.

The design of the Jupiter Bunk Cum Futon Cot often includes thoughtful features such as safety rails for the upper bunk, ensuring secure sleep for users. Some models also incorporate storage options such as drawers or shelves, enhancing organizational capabilities in smaller spaces.

In terms of aesthetics, It is available in a variety of finishes and styles to complement different interior décors. Whether opting for a sleek modern look or a more traditional design, homeowners can find options that suit their personal preferences and enhance the overall ambiance of their living room or guest area.

Overall, the Jupiter Bunk Cum Futon Cot exemplifies the modern approach to living room furniture, where space efficiency and multipurpose functionality are paramount. Its ability to serve as both a bunk bed and a futon ensures practicality without compromising on comfort or style. For individuals or families looking to maximize space in their living areas while maintaining flexibility in furniture usage, the Jupiter Bunk Cum Futon Cot offers an attractive and practical solution.',
  42000,
  29661,
  10,
  'Powder-Coated Steel Frame, Fabric Futon Mattress',
  '{"length": 2.0, "width": 1.0, "height": 1.7}',
  array['bunk-bed', 'futon', 'space-saving', 'metal']
);

INSERT INTO product_images (product_id, url, alt, position) 
VALUES 
  ((SELECT id FROM products WHERE slug = 'jupiter-bunk-cum-futon-cot'), 'https://oduvaeykaeabnpmyliut.supabase.co/storage/v1/object/public/spacecraftsdigital/products/jupiter-bunk-cum-futon-cot-1.jpg', 'Jupiter Bunk Cum Futon Cot - full view', 0),
  ((SELECT id FROM products WHERE slug = 'jupiter-bunk-cum-futon-cot'), 'https://oduvaeykaeabnpmyliut.supabase.co/storage/v1/object/public/spacecraftsdigital/products/jupiter-bunk-cum-futon-cot-2.jpg', 'Jupiter Bunk Cum Futon Cot - futon detail', 1);

-- Product 6: Luminous Steel Cot
INSERT INTO products (
  name, slug, category_id, brand_id, description, price, discount_price, 
  stock, material, dimensions, tags
) VALUES (
  'Luminous Steel Cot',
  'luminous-steel-cot',
  (SELECT id FROM categories WHERE slug = 'metal-cots'),
  (SELECT id FROM brands WHERE slug = 'spacecraft'),
  'Luminous Steel Cot is a distinguished brand specializing in the creation of exquisite bedroom furniture, particularly renowned for their metal king-sized beds, metal queen-sized beds, and steel cots with storage options. Their commitment to quality craftsmanship and innovative design ensures that each piece not only enhances the aesthetics of the bedroom but also provides practical functionality.

At the heart of Luminous Steel Cot''s offerings are their metal king-sized beds, which are crafted to be both robust and elegant. These beds are designed to accommodate large mattresses comfortably, providing ample space for individuals or couples to rest and relax. The frames are constructed using high-quality steel, known for its strength and durability, ensuring long-lasting support. Luminous Steel Cot pays meticulous attention to detail, incorporating features such as sturdy slats and reinforced joints to prevent sagging and ensure stability over time. The sleek and contemporary designs of their king-sized beds add a touch of sophistication to any bedroom décor, making them a preferred choice for those seeking both style and substance.

For those looking for a slightly smaller option, Luminous Steel Cot offers metal queen-sized beds that embody the same dedication to craftsmanship and durability. These beds are designed with comfort in mind, featuring ergonomic support systems that promote a restful sleep experience. The frames are available in various finishes, from classic matte black to modern brushed steel, allowing customers to choose a design that complements their personal taste and bedroom aesthetics perfectly. The queen-sized beds from Luminous Steel Cot are versatile pieces that blend seamlessly into any bedroom setting, whether contemporary or traditional.

One of the standout features of Luminous Steel Cot''s product line is their steel cots with storage options. These innovative designs combine the functionality of a comfortable sleeping surface with the practicality of integrated storage solutions. Perfect for optimizing space in smaller bedrooms or guest rooms, these cots feature built-in drawers or shelves beneath the mattress platform. This clever use of space allows users to store bedding, clothing, or other essentials conveniently, minimizing clutter and maximizing room organization. Luminous Steel Cot ensures that even their storage cots maintain the same high standards of construction and aesthetic appeal as their other products, ensuring a cohesive look throughout the bedroom.

In addition to their commitment to quality materials and craftsmanship, Luminous Steel Cot places a strong emphasis on customer satisfaction. They offer customizable options for their bed frames, allowing customers to select from a range of finishes and additional features to suit their specific preferences. Whether it''s choosing a headboard design, adjusting the height of the bed frame, or opting for unique storage configurations, Luminous Steel Cot ensures that each piece of furniture is tailored to meet the individual needs and tastes of their clientele.

In conclusion, Luminous Steel Cot is a trusted name in the realm of bedroom furniture, celebrated for their metal king-sized beds, metal queen-sized beds, and steel cots with innovative storage solutions. Their dedication to craftsmanship, combined with thoughtful design and customizable options, ensures that every piece not only enhances the functionality of the bedroom but also elevates its aesthetic appeal. Whether you''re furnishing a master bedroom, guest room, or any other living space, Luminous Steel Cot offers timeless furniture solutions that embody quality, comfort, and style.',
  31600,
  22373,
  10,
  'Steel Frame with Storage Options',
  '{"length": 2.0, "width": 1.6, "height": 0.95}',
  array['steel-cot', 'storage-bed', 'metal']
);

INSERT INTO product_images (product_id, url, alt, position) 
VALUES 
  ((SELECT id FROM products WHERE slug = 'luminous-steel-cot'), 'https://oduvaeykaeabnpmyliut.supabase.co/storage/v1/object/public/spacecraftsdigital/products/luminous-steel-cot-1.jpg', 'Luminous Steel Cot - front view', 0);

-- Product 7: Sputnic Convertable Wooden Leg Bunk Bed
INSERT INTO products (
  name, slug, category_id, brand_id, description, price, discount_price, 
  stock, material, dimensions, tags
) VALUES (
  'Sputnic Convertable Wooden Leg Bunk Bed',
  'sputnic-convertable-wooden-leg-bunk-bed',
  (SELECT id FROM categories WHERE slug = 'bunk-beds'),
  (SELECT id FROM brands WHERE slug = 'spacecraft'),
  'The Sputnic Convertable Wooden Leg Bunk Bed offers a versatile and space-saving solution for bedrooms, maximizing functionality without compromising on style. Crafted with sturdy wooden legs, this bunk bed combines durability with a modern aesthetic.

**Sturdy Construction:**
Built with robust materials, including solid wood legs and a strong frame, the Sputnic Bunk Bed ensures stability and reliability. It provides a secure sleeping environment for children or guests.

**Convertible Design:**
The bunk bed''s innovative convertable feature allows it to transform effortlessly from a traditional bunk bed into two separate beds. This flexibility accommodates changing needs over time, making it suitable for growing families or guest accommodations.

**Space-saving Efficiency:**
Designed to optimize room space, the Sputnic Bunk Bed utilizes vertical rather than horizontal space. This layout frees up floor area for additional furniture or activities, making it ideal for smaller bedrooms or shared living spaces.

**Versatile Use:**
Ideal for various settings, the bunk bed serves as an efficient sleeping solution for siblings sharing a room or for hosting overnight guests. Its adaptable design ensures comfort and convenience in any living environment.

**Safety Features:**
Safety is a priority with the Sputnic Bunk Bed, featuring built-in guardrails on the upper bunk to prevent accidental falls during sleep. Sturdy ladders ensure safe access to the top bunk, offering peace of mind for parents and users alike.

**Assembly and Maintenance:**
Setting up the Sputnic Bunk Bed is straightforward, with clear instructions provided for easy assembly. The wooden legs and frame are easy to clean and maintain, ensuring long-lasting durability and aesthetic appeal.

**Conclusion:**
In conclusion, the Sputnic Convertable Wooden Leg Bunk Bed combines functionality with space-saving efficiency, making it an excellent choice for modern living spaces. Its durable construction, convertible design, and safety features ensure both comfort and practicality, accommodating various sleeping arrangements and room configurations with ease.',
  38100,
  26949,
  10,
  'Solid Wood Legs, Metal Frame',
  '{"length": 2.0, "width": 1.0, "height": 1.6}',
  array['bunk-bed', 'convertible', 'wooden-leg', 'space-saving']
);

INSERT INTO product_images (product_id, url, alt, position) 
VALUES 
  ((SELECT id FROM products WHERE slug = 'sputnic-convertable-wooden-leg-bunk-bed'), 'https://oduvaeykaeabnpmyliut.supabase.co/storage/v1/object/public/spacecraftsdigital/products/sputnic-convertable-wooden-leg-bunk-bed-1.jpg', 'Sputnic Convertable Wooden Leg Bunk Bed - assembled view', 0),
  ((SELECT id FROM products WHERE slug = 'sputnic-convertable-wooden-leg-bunk-bed'), 'https://oduvaeykaeabnpmyliut.supabase.co/storage/v1/object/public/spacecraftsdigital/products/sputnic-convertable-wooden-leg-bunk-bed-2.jpg', 'Sputnic Convertable Wooden Leg Bunk Bed - separated configuration', 1);

-- Product 8: Rainbow Convertable Bunk Bed
INSERT INTO products (
  name, slug, category_id, brand_id, description, price, discount_price, 
  stock, material, dimensions, tags
) VALUES (
  'Rainbow Convertable Bunk Bed',
  'rainbow-convertable-bunk-bed',
  (SELECT id FROM categories WHERE slug = 'bunk-beds'),
  (SELECT id FROM brands WHERE slug = 'spacecraft'),
  'The Rainbow Convertable Bunk Bed exemplifies versatile and space-saving design, ideal for maximizing functionality in smaller living spaces. This multipurpose bed seamlessly transforms from a single bed to a bunk bed, catering to various needs.

**Design and Structure:**
Crafted with sturdy materials, the Rainbow Convertable Bunk Bed features a robust frame that supports both configurations—single bed and bunk bed—without compromising on stability. This ensures safety and durability for users of all ages.

**Convertable Functionality:**
The bed''s innovative design allows it to easily convert from a single bed into a bunk bed, offering flexibility in room layouts and accommodating changing needs over time. This versatility makes it suitable for children''s rooms, guest rooms, or even dormitories.

**Space-saving Efficiency:**
Designed to optimize space, the Rainbow Convertable Bunk Bed is an excellent choice for compact living environments. It utilizes vertical space effectively, freeing up floor space for other furniture or activities, thereby maximizing room functionality.

**Versatility and Practicality:**
As a multipurpose bed, it serves multiple functions in different settings. It provides comfortable sleeping arrangements for siblings or guests when configured as a bunk bed, and can be quickly converted to a single bed for individual use.

**Safety Features:**
Safety is prioritized with built-in guardrails on the upper bunk to prevent accidental falls during sleep. The sturdy ladder ensures easy and safe access to the top bunk, offering peace of mind for parents and users alike.

**Assembly and Maintenance:**
Setting up the Rainbow Convertable Bunk Bed is straightforward, with clear instructions provided for easy assembly. The durable materials used require minimal maintenance, ensuring long-term reliability and functionality.

**Conclusion:**
In conclusion, the Rainbow Convertable Bunk Bed combines practicality with space-saving efficiency, making it an excellent choice for modern living spaces. Its versatile design, durable construction, and safety features ensure both comfort and functionality, catering to various sleeping arrangements and room configurations with ease.',
  26999,
  21017,
  10,
  'Metal Frame with Reinforced Joints',
  '{"length": 2.0, "width": 1.0, "height": 1.6}',
  array['bunk-bed', 'convertible', 'metal']
);

INSERT INTO product_images (product_id, url, alt, position) 
VALUES 
  ((SELECT id FROM products WHERE slug = 'rainbow-convertable-bunk-bed'), 'https://oduvaeykaeabnpmyliut.supabase.co/storage/v1/object/public/spacecraftsdigital/products/rainbow-convertable-bunk-bed-1.jpg', 'Rainbow Convertable Bunk Bed - bunk configuration', 0),
  ((SELECT id FROM products WHERE slug = 'rainbow-convertable-bunk-bed'), 'https://oduvaeykaeabnpmyliut.supabase.co/storage/v1/object/public/spacecraftsdigital/products/rainbow-convertable-bunk-bed-2.jpg', 'Rainbow Convertable Bunk Bed - single configuration', 1);

-- Product 9: Zenith Rocking Easy Chair
INSERT INTO products (
  name, slug, category_id, brand_id, description, price, discount_price, 
  stock, material, dimensions, tags
) VALUES (
  'Zenith Rocking Easy Chair',
  'zenith-rocking-easy-chair',
  (SELECT id FROM categories WHERE slug = 'rocking-chairs'),
  (SELECT id FROM brands WHERE slug = 'spacecraft'),
  'The Zenith Rocking Easy Chair is a sophisticated blend of style, comfort, and practicality, making it an indispensable piece of furniture for modern living spaces. Designed to enhance your relaxation and convenience, this chair incorporates several features that make it a standout option for anyone looking to optimize their home environment.

One of the primary advantages of the chair is its space-saving design. In today''s urban living, where space is often at a premium, finding furniture that doesn''t overcrowd your space is essential. This chair is designed with a compact footprint, ensuring that it fits comfortably in small or tight areas without sacrificing comfort. Its space-saving chair features allow it to blend seamlessly into a variety of environments, whether it''s a compact apartment, a cozy reading nook, or a chic office lounge.

The chair''s foldable nature is another key feature that sets it apart. As a folding chair, It offers the versatility to be easily stored away when not in use. This makes it ideal for spaces where flexibility is required. When folded, it takes up minimal space, which is especially beneficial for those who occasionally need extra seating but don''t want a permanent addition to their decor. The folding mechanism is smooth and straightforward, ensuring that the chair can be set up or put away quickly and effortlessly.

Comfort is a top priority for the chair, which is why it also functions as a lazy chair. With its ergonomic design, it provides excellent support and relaxation. The gentle rocking motion is particularly soothing, offering a calming experience that can help reduce stress and enhance your leisure time. Whether you''re reading a book, watching television, or simply unwinding after a long day, this easy chair adapts to your needs, making relaxation effortless.

Constructed with high-quality materials, It promises durability and long-lasting performance. The frame is crafted from robust yet lightweight materials, allowing for easy movement and repositioning. The upholstery is soft and comfortable, providing a luxurious feel while maintaining its durability. This ensures that the chair remains a staple in your home for years to come.

In addition to its practical features, It''s design aesthetic complements various interior styles. Its sleek lines and contemporary look make it a versatile choice that enhances the visual appeal of any room. Whether used in a living room, study, or office, this chair adds a touch of elegance and modernity.

Overall, the Zenith Rocking Easy Chair is a prime example of multipurpose furniture that excels in both form and function. Its space-saving, foldable design combined with its relaxing, easy chair attributes makes it an excellent choice for those seeking a practical and stylish seating solution.',
  14200,
  10085,
  10,
  'Metal Frame, Cushioned Fabric Upholstery',
  '{"length": 0.75, "width": 0.7, "height": 1.0}',
  array['rocking-chair', 'easy-chair', 'seating', 'space-saving']
);

INSERT INTO product_images (product_id, url, alt, position) 
VALUES 
  ((SELECT id FROM products WHERE slug = 'zenith-rocking-easy-chair'), 'https://oduvaeykaeabnpmyliut.supabase.co/storage/v1/object/public/spacecraftsdigital/products/zenith-rocking-easy-chair-1.jpg', 'Zenith Rocking Easy Chair - front view', 0),
  ((SELECT id FROM products WHERE slug = 'zenith-rocking-easy-chair'), 'https://oduvaeykaeabnpmyliut.supabase.co/storage/v1/object/public/spacecraftsdigital/products/zenith-rocking-easy-chair-2.jpg', 'Zenith Rocking Easy Chair - side angle', 1),
  ((SELECT id FROM products WHERE slug = 'zenith-rocking-easy-chair'), 'https://oduvaeykaeabnpmyliut.supabase.co/storage/v1/object/public/spacecraftsdigital/products/zenith-rocking-easy-chair-3.jpg', 'Zenith Rocking Easy Chair - detail view', 2);

-- Verification Query: Check if products were inserted successfully
SELECT p.name, p.slug, c.name as category, b.name as brand, p.price, p.discount_price, p.stock,
       (SELECT COUNT(*) FROM product_images WHERE product_id = p.id) as image_count
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN brands b ON p.brand_id = b.id
WHERE b.slug = 'spacecraft'
ORDER BY p.created_at DESC;
