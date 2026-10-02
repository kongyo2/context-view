/**
 * Reads a streamed event to its end, as the engine reads a turn's step, and
 * answers what the stream returned.
 *
 * @param stream the stream `$.turn.step` hands back
 * @returns the step's result
 */
export async function readToEnd<R>(
  stream: AsyncGenerator<unknown, R>,
): Promise<R> {
  let step = await stream.next()

  while (step.done !== true) {
    step = await stream.next()
  }

  return step.value
}
