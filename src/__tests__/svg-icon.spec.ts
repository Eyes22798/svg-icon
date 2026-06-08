import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SvgIcon from '../svg-icon.vue'

describe('SvgIcon', () => {
  it('renders with correct href pointing to icon symbol', () => {
    const wrapper = mount(SvgIcon, {
      props: { name: 'close' }
    })
    const use = wrapper.find('use')
    expect(use.attributes('href')).toBe('#icon-close')
  })

  it('has base class svg-icon', () => {
    const wrapper = mount(SvgIcon, {
      props: { name: 'test' }
    })
    expect(wrapper.classes()).toContain('svg-icon')
  })

  it('appends single className string', () => {
    const wrapper = mount(SvgIcon, {
      props: { name: 'test', className: 'my-icon' }
    })
    expect(wrapper.classes()).toContain('svg-icon')
    expect(wrapper.classes()).toContain('my-icon')
  })

  it('appends array of classNames', () => {
    const wrapper = mount(SvgIcon, {
      props: { name: 'test', className: ['foo', 'bar'] }
    })
    expect(wrapper.classes()).toContain('foo')
    expect(wrapper.classes()).toContain('bar')
  })

  it('adds interact class when interact prop is true', () => {
    const wrapper = mount(SvgIcon, {
      props: { name: 'test', interact: true }
    })
    expect(wrapper.classes()).toContain('interact')
  })

  it('adds disabled class when disabled prop is true', () => {
    const wrapper = mount(SvgIcon, {
      props: { name: 'test', disabled: true }
    })
    expect(wrapper.classes()).toContain('disabled')
  })

  it('sets CSS variables for hover and active colors', () => {
    const wrapper = mount(SvgIcon, {
      props: {
        name: 'test',
        interactHoverColor: '#ff0000',
        interactActiveColor: '#00ff00'
      }
    })
    const style = wrapper.attributes('style')
    expect(style).toContain('--hover-color: #ff0000')
    expect(style).toContain('--active-color: #00ff00')
  })

  it('renders foreignObject mask for interact', () => {
    const wrapper = mount(SvgIcon, {
      props: { name: 'test', interact: true }
    })
    expect(wrapper.find('foreignObject').exists()).toBe(true)
  })
})
