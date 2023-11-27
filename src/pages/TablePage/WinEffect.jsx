import React from 'react'
import Styles from "./Index.module.scss"

export default function WinEffect({side , value}) {
    console.log(side)
  return (
    <div className={Styles.WinEffect}>
      ${value.toFixed(2)}
    </div>
  )
}
