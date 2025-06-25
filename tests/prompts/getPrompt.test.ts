import { getPrompt } from '../../prompts'

test('returns prompt', () => {
  expect(getPrompt('copilot_intro')).toBe('Hello from MyRoofGenius Copilot.')
})
