# Agentflöde för Blush & Bluff

## Arbeta från GitHub Projects

1. Skapa en **Story** från mallen och fyll i mål, acceptanskriterier och avgränsningar.
2. Lägg Issuen i Project-status **Ready for agent**.
3. Läs storyn en sista gång och lägg etiketten `agent:ready`.
4. Agenten skapar en pull request. Läs agentgranskningen och kontrollera sidan själv.
5. Merga bara när CI är grön och du vill godkänna ändringen.
6. Vid en planerad release: kör **Release – Blush & Bluff** från Actions. Produktion ska alltid kräva ditt godkännande.

## Säkerhetsregler

- Lägg `OPENAI_API_KEY` som en GitHub Actions-hemlighet, aldrig i en Issue eller i koden.
- Lägg endast `agent:ready` på stories som du själv har granskat.
- Agenten får skapa pull requests, men får aldrig merga eller publicera själv.
- Skriv inte lösenord, API-nycklar eller personuppgifter i en story.
