-- Restore lost instructions on English stress-pattern questions.
-- 19 rows were imported with a bare vocabulary word as the stem
-- ("capitalism") while all four options are stress-marked variants of that
-- same word. The task is unambiguous, so restore the standard instruction.
-- Guarded to bare single-word stems only: safe to re-run.
UPDATE jamb_questions
SET question = 'Choose the option with the correct stress pattern: ' || question
WHERE id IN (
  '1c3ac33f-7fb7-4466-9bf1-9d90992aa7b3',
  '58232ab6-c8a9-4b0c-b7bc-48826e305e77',
  '22d6c65d-8c7c-425e-a5b8-5410b3fe750e',
  'f804ddfc-fade-482e-9dad-58d673010f50',
  '17ff7ea6-3ac2-49b9-8877-81b0395b1e1a',
  '8c61beeb-c2d5-429c-8d43-d0277a95ae35',
  '22574713-edba-4007-89f1-37a906ebe761',
  'cfe36fea-9639-4df7-bc5d-60d76c2738b0',
  '83b6a650-4232-4002-88e5-333d05fb2877',
  'c44812b7-f97f-47ad-a411-06e30d2b552c',
  '22324147-7032-4b05-8374-e9bc5437be71',
  '6de9a787-e7d8-492a-9f66-ccc3dc636ff1',
  'dc5803b2-d6c8-4eb6-a120-99d6617c4e01',
  '05618323-eecc-4b87-bfd2-44c2bdc62e21',
  '8e28ed21-470a-4599-b54c-7f13b62d0aa2',
  '2faed48d-fe7b-402e-ae5d-33154174df64',
  '32fb8c16-e0e2-4e84-b7e5-bcdd93469dda',
  'a16966cf-849c-48ee-a9c7-69a05328cae7',
  '262daeac-8273-4331-8ac4-d818239fafea'
)
AND question NOT LIKE '% %';
