import randomNamesData from '@/data/randomNames.json';

export function getRandomName(): string {
  const names = randomNamesData.names;
  const randomIndex = Math.floor(Math.random() * names.length);
  return names[randomIndex];
}