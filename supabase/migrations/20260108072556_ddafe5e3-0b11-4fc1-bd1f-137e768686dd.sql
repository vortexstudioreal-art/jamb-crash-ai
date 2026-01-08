-- Add display_title column for collaborators to customize their badge
ALTER TABLE user_roles ADD COLUMN IF NOT EXISTS display_title text;

-- Update novel cover images with the provided URLs
UPDATE novels SET cover_image_url = 'https://i.ibb.co/8DxNHFFf/the-life-changer-cover-picture.jpg' WHERE title ILIKE '%life changer%';
UPDATE novels SET cover_image_url = 'https://i.ibb.co/23zNp78X/the-lekki-headmaster-cover-picture.jpg' WHERE title ILIKE '%lekki headmaster%';
UPDATE novels SET cover_image_url = 'https://i.ibb.co/W4hmPy4j/faceless-cover-picture.jpg' WHERE title ILIKE '%faceless%';
UPDATE novels SET cover_image_url = 'https://i.ibb.co/7xjnS5NW/second-class-citizens-cover-picture.jpg' WHERE title ILIKE '%second class citizen%';
UPDATE novels SET cover_image_url = 'https://i.ibb.co/pvqCxD6g/unexpected-joy-cover-picture.jpg' WHERE title ILIKE '%unexpected joy%';
UPDATE novels SET cover_image_url = 'https://i.ibb.co/XZKMNSt8/native-son-cover-picture.png' WHERE title ILIKE '%native son%';
UPDATE novels SET cover_image_url = 'https://i.ibb.co/231BkPPr/havest-of-corruption-cover-picture.jpg' WHERE title ILIKE '%harvest of corruption%';
UPDATE novels SET cover_image_url = 'https://i.ibb.co/gLfsJLHR/the-lion-and-the-jewel-cover-picture.jpg' WHERE title ILIKE '%lion and the jewel%';
UPDATE novels SET cover_image_url = 'https://i.ibb.co/k2DY1MC9/othello-cover-pic.jpg' WHERE title ILIKE '%othello%';
UPDATE novels SET cover_image_url = 'https://i.ibb.co/BVQcxcSL/ambush-c-p.jpg' WHERE title ILIKE '%ambush%';
UPDATE novels SET cover_image_url = 'https://i.ibb.co/G4jp6k53/Piano-and-Drums.jpg' WHERE title ILIKE '%piano and drums%';
UPDATE novels SET cover_image_url = 'https://i.ibb.co/zVYtcxwZ/The-Anvil-and-the-Hammer.jpg' WHERE title ILIKE '%anvil and the hammer%';
UPDATE novels SET cover_image_url = 'https://i.ibb.co/xKshhSF2/The-Dining-Table.jpg' WHERE title ILIKE '%dining table%';
UPDATE novels SET cover_image_url = 'https://i.ibb.co/k6MQg9Ss/The-Panic-of-Growing-Older.jpg' WHERE title ILIKE '%panic of growing older%';
UPDATE novels SET cover_image_url = 'https://i.ibb.co/GSCcF7t/Vanity.jpg' WHERE title ILIKE '%vanity%';
UPDATE novels SET cover_image_url = 'https://i.ibb.co/d4hQ24kY/The-Proud-King.jpg' WHERE title ILIKE '%proud king%';
UPDATE novels SET cover_image_url = 'https://i.ibb.co/Y4nCZr63/The-Pulley.jpg' WHERE title ILIKE '%pulley%';
UPDATE novels SET cover_image_url = 'https://i.ibb.co/dN47qYW/The-School-Boy.jpg' WHERE title ILIKE '%school boy%';
UPDATE novels SET cover_image_url = 'https://i.ibb.co/VnCx9tZ/crossing-the-bar-cover-picture.jpg' WHERE title ILIKE '%crossing the bar%';