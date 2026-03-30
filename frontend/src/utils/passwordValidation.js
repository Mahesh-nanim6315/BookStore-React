import * as Yup from 'yup'

const passwordRuleMessage = 'Password must be at least 8 characters and include uppercase, lowercase, number, and symbol.'

const strongPasswordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/

export const strongPassword = (label = 'Password') =>
  Yup.string()
    .required(`${label} is required.`)
    .matches(strongPasswordPattern, passwordRuleMessage)

export const optionalStrongPassword = () =>
  Yup.string()
    .transform((value) => value || '')
    .test('strong-password-if-present', passwordRuleMessage, (value) => !value || strongPasswordPattern.test(value))

export const strongPasswordMessage = passwordRuleMessage
