import { shallowMount } from '@vue/test-utils'
import CustomButton from '../../src/index.vue'

describe('CustomButton', () => {
  it('renders props.text when passed', () => {
    const text = 'new text'
    const wrapper = shallowMount(CustomButton, {
      propsData: { text }
    })
    expect(wrapper.text()).toMatch(text)
  })
})
