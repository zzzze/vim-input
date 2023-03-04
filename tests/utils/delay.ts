export default async function delay (n: number) {
  await new Promise(resolve => setTimeout(resolve, n))
}
