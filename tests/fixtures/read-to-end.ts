export async function readToEnd<R>(
  stream: AsyncGenerator<unknown, R>,
): Promise<R> {
  let step = await stream.next()

  while (step.done !== true) {
    step = await stream.next()
  }

  return step.value
}
