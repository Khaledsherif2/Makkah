import { memo, useState } from 'react'
import Swal from 'sweetalert2'

const Meters = memo(({ setFormData, edit, user }) => {
  const [done, setDone] = useState(false)
  const HandleClick = async () => {
    let inputCount = 6

    const addInputs = () => {
      const swalInputContainer = document.getElementById('swal-input-container')
      const inputContainer = document.createElement('div')
      inputContainer.className = 'input-container'

      const input1 = document.createElement('input')
      input1.id = `swal-input${inputCount++}`
      input1.className = 'swal2-input'
      input1.type = 'number'
      input1.addEventListener('input', updateResult)

      const input2 = document.createElement('input')
      input2.id = `swal-input${inputCount++}`
      input2.className = 'swal2-input'
      input2.type = 'number'
      input2.addEventListener('input', updateResult)

      const input3 = document.createElement('input')
      input3.id = `swal-input${inputCount++}`
      input3.className = 'swal2-input'
      input3.type = 'number'
      input3.defaultValue = 1
      input3.addEventListener('input', updateResult)

      const input4 = document.createElement('input')
      input4.id = `swal-input${inputCount++}`
      input4.className = 'swal2-input'
      input4.type = 'number'
      input4.readOnly = true

      const input5 = document.createElement('input')
      input5.id = `swal-input${inputCount++}`
      input5.className = 'swal2-input'
      input5.defaultValue = 20
      input5.type = 'number'
      input5.addEventListener('input', updateResult)

      const input6 = document.createElement('input')
      input6.id = `swal-input${inputCount++}`
      input6.className = 'swal2-input'
      input6.type = 'number'
      input6.readOnly = true

      inputContainer.appendChild(input1)
      inputContainer.appendChild(input2)
      inputContainer.appendChild(input3)
      inputContainer.appendChild(input4)
      inputContainer.appendChild(input5)
      inputContainer.appendChild(input6)
      swalInputContainer.appendChild(inputContainer)
    }

    const updateResult = () => {
      const inputs = document.querySelectorAll('#swal-input-container input')
      for (let i = 0; i < inputs.length; i += 6) {
        const input1 = inputs[i]
        const input2 = inputs[i + 1]
        const input3 = inputs[i + 2]
        const input4 = inputs[i + 3]
        const input5 = inputs[i + 4]
        const input6 = inputs[i + 5]

        if (input1 && input2 && input3 && input4 && input5 && input6) {
          const value1 = parseFloat(input1.value) || 0
          const value2 = parseFloat(input2.value) || 0
          const value3 = parseFloat(input3.value) || 0
          input4.value = (value1 * value2 * value3).toFixed(2)
          const value5 = parseFloat(input5.value) || 0
          input6.value = Math.ceil(input4.value * value5)
        }
      }
    }

    const meters = user?.data?.meters?.slice(0, -1)
    const html = edit
      ? meters
          .map((meter) => {
            return `
            <div class="input-container">
              <input id="swal-input1" class="swal2-input" type="number" value=${meter.inputOne} oninput="updateResult()">
              <input id="swal-input2" class="swal2-input" type="number" value=${meter.inputTwo} oninput="updateResult()">
              <input id="swal-input3" class="swal2-input" type="number" value=${meter.inputThree} oninput="updateResult()">
              <input id="swal-input4" class="swal2-input" type="number" value=${meter.meters} readonly>
              <input id="swal-input5" class="swal2-input" type="number" value=${meter.meterPrice || 20} oninput="updateResult()">
              <input id="swal-input6" class="swal2-input" type="number" value=${meter.price} readonly>
            </div>
          `
          })
          .join('')
      : `
      <div class="input-container">
        <input id="swal-input1" class="swal2-input" type="number" oninput="updateResult()">
        <input id="swal-input2" class="swal2-input" type="number" oninput="updateResult()">
        <input id="swal-input3" class="swal2-input" type="number" value=1 oninput="updateResult()">
        <input id="swal-input4" class="swal2-input" type="number" readonly>
        <input id="swal-input5" class="swal2-input" type="number" value=20 oninput="updateResult()">
        <input id="swal-input6" class="swal2-input" type="number" readonly>
      </div>
    `

    await Swal.fire({
      title: 'الأمتار',
      html: `
        <div id="swal-input-container">
          ${html}
        </div>
        <button type="button" id="add-input-btn" class="swal2-confirm swal2-styled" style="margin-top: 10px;">اضافة</button>
      `,
      focusConfirm: false,
      confirmButtonColor: '#3085d6',
      allowOutsideClick: false,
      allowEscapeKey: false,
      confirmButtonText: 'تمام !',
      didOpen: () => {
        const inputs = document.querySelectorAll('#swal-input-container input')
        inputs.forEach((input) => input.addEventListener('input', updateResult))
        document.getElementById('add-input-btn').addEventListener('click', addInputs)
      },
      preConfirm: () => {
        const inputs = document.querySelectorAll('#swal-input-container input')
        const values = []
        let totalMeters = 0
        let totalPrice = 0
        let totalNum = 0
        for (let i = 0; i < inputs.length; i += 6) {
          const input1 = inputs[i]
          const input2 = inputs[i + 1]
          const input3 = inputs[i + 2]
          const input4 = inputs[i + 3]
          const input5 = inputs[i + 4]
          const input6 = inputs[i + 5]

          if (input1 && input2 && input3 && input4 && input5) {
            const value1 = input1.value
            const value2 = input2.value
            const value3 = input3.value
            const result1 = parseFloat(input4.value) || 0
            const value5 = input5.value
            const result2 = Math.ceil(input6.value / 5) * 5 || 0
            totalMeters += result1
            totalPrice += result2
            totalNum += +value3
            values.push({
              inputOne: value1,
              inputTwo: value2,
              inputThree: value3,
              meters: result1,
              meterPrice: value5,
              price: result2
            })
          }
        }
        values.push({ totalMeters, totalPrice, totalNum })

        return values
      }
    }).then((data) => {
      if (data.isConfirmed) {
        setDone(true)
        setFormData((prevState) => ({
          ...prevState,
          data: {
            ...prevState.data,
            meters: data.value
          }
        }))
      }
    })
  }
  return (
    <input
      style={done ? { border: '2px solid var(--bright-color)' } : {}}
      type="button"
      className="form-control"
      value="اضغط للاضافة"
      onClick={HandleClick}
    />
  )
})

Meters.displayName = 'Meters'
export default Meters
