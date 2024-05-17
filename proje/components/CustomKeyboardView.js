import React, { PureComponent } from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native'


const android = Platform.OS == 'android'
export default function CustomKeyboardView({children}) {

    return (
      <KeyboardAvoidingView behavior={android? 'padding':'height'} style={{flex: 1}}>
       <ScrollView style={{flex:1}} bounces={false} showsVerticalScrollIndicator={false}>
       {
         children
       }
       </ScrollView>
      </KeyboardAvoidingView>
    )
  
}
