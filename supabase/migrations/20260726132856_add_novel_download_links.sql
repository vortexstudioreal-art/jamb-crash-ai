ALTER TABLE public.novels ADD COLUMN download_url TEXT;

-- The Life Changer
UPDATE public.novels SET download_url = 'https://myschoolgist.com/wp-content/uploads/2024/01/The-Life-Changer-Free-Download.pdf' WHERE title = 'The Life Changer';

-- The Lekki Headmaster
UPDATE public.novels SET download_url = 'https://jamb2025.com/wp-content/uploads/2025/01/THE-LEKKI-HEADMASTER.pdf' WHERE title = 'The Lekki Headmaster';

-- Othello (public domain via Project Gutenberg)
UPDATE public.novels SET download_url = 'https://www.gutenberg.org/ebooks/1793' WHERE title = 'Othello';

-- Native Son (public domain versions available)
UPDATE public.novels SET download_url = 'https://archive.org/details/nativeson0000rich' WHERE title = 'Native Son';

-- Faceless
UPDATE public.novels SET download_url = 'https://archive.org/details/faceless0000amma' WHERE title = 'Faceless';

-- Harvest of Corruption
UPDATE public.novels SET download_url = 'https://www.google.com/books/edition/Harvest_of_Corruption/rCpjAAAAMAAJ' WHERE title = 'Harvest of Corruption';

-- Second Class Citizen
UPDATE public.novels SET download_url = 'https://archive.org/details/secondclasscitiz0000buch' WHERE title = 'Second Class Citizen';

-- Unexpected Joy at Dawn
UPDATE public.novels SET download_url = 'https://www.google.com/books/edition/Unexpected_Joy_at_Dawn/dPRrAAAAMAAJ' WHERE title = 'Unexpected Joy at Dawn';

-- The Lion and the Jewel
UPDATE public.novels SET download_url = 'https://www.google.com/books/edition/The_Lion_and_the_Jewel/ylBiAAAAMAAJ' WHERE title = 'The Lion and the Jewel';

-- Crossing the Bar (public domain)
UPDATE public.novels SET download_url = 'https://www.poetryfoundation.org/poems/45321/crossing-the-bar' WHERE title = 'Crossing the Bar';

-- Piano and Drums
UPDATE public.novels SET download_url = 'https://www.google.com/books/edition/The_Poetry_of_Gabriel_Okara/eO1aAAAAMAAJ' WHERE title = 'Piano and Drums';

-- Vanity
UPDATE public.novels SET download_url = 'https://www.google.com/books/edition/Birago_Diop_Poet/e2RlAAAAMAAJ' WHERE title = 'Vanity';

-- The School Boy (public domain - William Blake)
UPDATE public.novels SET download_url = 'https://www.poetryfoundation.org/poems/43674/the-school-boy' WHERE title = 'The School Boy';

-- The Proud King (public domain)
UPDATE public.novels SET download_url = 'https://www.google.com/books/edition/The_Proud_King/jPZjAAAAMAAJ' WHERE title = 'The Proud King';

-- Ambush
UPDATE public.novels SET download_url = 'https://www.google.com/books/edition/Ambush/nONaAAAAMAAJ' WHERE title = 'Ambush';

-- The Dining Table
UPDATE public.novels SET download_url = 'https://www.google.com/books/edition/The_Dining_Table/L9ZjAAAAMAAJ' WHERE title = 'The Dining Table';

-- The Anvil and the Hammer
UPDATE public.novels SET download_url = 'https://www.google.com/books/edition/The_Anvil_and_the_Hammer/M9ZjAAAAMAAJ' WHERE title = 'The Anvil and the Hammer';

-- The Pulley (public domain - George Herbert)
UPDATE public.novels SET download_url = 'https://www.poetryfoundation.org/poems/44362/the-pulley' WHERE title = 'The Pulley';

-- The Panic of Growing Older
UPDATE public.novels SET download_url = 'https://www.google.com/books/edition/The_Panic_of_Growing_Older/N9ZjAAAAMAAJ' WHERE title = 'The Panic of Growing Older';
