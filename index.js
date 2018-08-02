/**
 * Created by JetBrains WebStorm.
 * Author: yoon
 * Date: 18-7-30
 * Time: 上午9:31
 * Desc: 固定字体大小　不随系统字体大小而变化
 * @use import in root file (index.js)
 */
import React from 'react'
import {
  Text,
  TextInput,
  PixelRatio,
  Platform,
} from 'react-native'

const ReactNativePropRegistry = require('ReactNativePropRegistry');

const fontSizeScale = PixelRatio.getFontScale()

const originTextRender = Text.prototype.render
const originTextInputRender = TextInput.prototype.render

function defaultFontSize() {
  return Platform.OS === 'ios' ? 15 : 14
}

function fixedFontSize(target) {
  return function () {
    const originComponent = target.apply(this, arguments);
    return React.cloneElement(originComponent, {
      allowFontScaling: false
    })
  }
}

Text.prototype.render = fixedFontSize(originTextRender)
// TextInput.prototype.render = fixedFontSize(originTextInputRender)
TextInput.prototype.render = function () {
  const originComponent = originTextInputRender.apply(this, arguments);
  try {
    const originText = originComponent.props.children
    let originStyle = originText.props.style
    let newStyle = {
      fontSize: defaultFontSize()
    }
    let textStyle = originStyle[0]

    if (Number.isInteger(textStyle)) {
      textStyle = ReactNativePropRegistry.getByID(textStyle)
    }

    if (Array.isArray(textStyle)) {
      newStyle = textStyle.reduce((pre, curr) => {
        let styleItem = curr || {}
        if (Number.isInteger(styleItem)) {
        styleItem = ReactNativePropRegistry.getByID(styleItem)
      }
      return {...pre, ...styleItem}
    }, newStyle)
    } else {
      newStyle = {...newStyle, ...(textStyle || {})}
    }
    newStyle.fontSize = newStyle.fontSize / fontSizeScale

    return React.cloneElement(originComponent, {
      children: {
        ...originText,
      props: {
        ...originText.props,
      style: newStyle
    }
  }
  })
  } catch (e) {
    return originComponent
  }
}
