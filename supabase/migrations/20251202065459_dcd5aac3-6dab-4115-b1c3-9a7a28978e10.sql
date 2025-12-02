-- Adicionar 150 FitCoins para gabrielschuberts@gmail.com
UPDATE profiles 
SET token_balance = token_balance + 150 
WHERE id = 'c46a10c3-d882-4fb7-b18e-823857fe11f5';

-- Registrar transação
INSERT INTO token_transactions (user_id, amount, description)
VALUES ('c46a10c3-d882-4fb7-b18e-823857fe11f5', 150, 'Crédito manual - Administração');