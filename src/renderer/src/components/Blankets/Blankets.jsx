import { memo, useState } from 'react'
import Swal from 'sweetalert2'

const Blankets = memo(({ setFormData, user, edit }) => {
  const [done, setDone] = useState(false)
  const handleBlankets = () => {
    let inputCount = 3
    const addInputs = () => {
      const swalInputContainer = document.getElementById('swal-input-container')
      const inputContainer = document.createElement('div')
      inputContainer.classList.add('input-container', 'blanket')

      const input1 = document.createElement('input')
      input1.id = `swal-input${inputCount++}`
      input1.className = 'swal2-input'
      input1.type = 'number'
      input1.addEventListener('input', updateResult)

      const input2 = document.createElement('input')
      input2.id = `swal-input${inputCount++}`
      input2.className = 'swal2-input'
      input2.type = 'number'
      input2.defaultValue = 50
      input2.addEventListener('input', updateResult)

      const input3 = document.createElement('input')
      input3.id = `swal-input${inputCount++}`
      input3.className = 'swal2-input'
      input3.type = 'number'
      input3.readOnly = true

      inputContainer.appendChild(input1)
      inputContainer.appendChild(input2)
      inputContainer.appendChild(input3)
      swalInputContainer.appendChild(inputContainer)
    }

    const updateResult = () => {
      const inputs = document.querySelectorAll('#swal-input-container input')
      for (let i = 0; i < inputs.length; i += 3) {
        const input1 = inputs[i]
        const input2 = inputs[i + 1]
        const input3 = inputs[i + 2]

        if (input1 && input2 && input3) {
          const value1 = parseFloat(input1.value) || 0
          const value2 = parseFloat(input2.value) || 0
          input3.value = value1 * value2
        }
      }
    }

    const blankets = user?.data?.blanketsPrice?.slice(0, -1)
    const html = edit
      ? blankets
          .map((blanket) => {
            return `
            <div class="input-container blanket">
              <input id="swal-input1" class="swal2-input" type="number" value=${blanket.inputOne} oninput="updateResult()">
              <input id="swal-input2" class="swal2-input" type="number" value=${blanket.inputTwo} oninput="updateResult()">
              <input id="swal-input3" class="swal2-input" type="number" value=${blanket.price} readonly>
            </div>
          `
          })
          .join('')
      : `
        <div class="input-container blanket">
          <input id="swal-input1" class="swal2-input" type="number">
          <input id="swal-input2" class="swal2-input" type="number" value=50>
          <input id="swal-input3" class="swal2-input" type="number" readonly>
        </div>
        `

    Swal.fire({
      title: 'سعر البطاطين',
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
        let totalPrice = 0
        let totalNum = 0
        for (let i = 0; i < inputs.length; i += 3) {
          const input1 = inputs[i]
          const input2 = inputs[i + 1]
          const input3 = inputs[i + 2]

          if (input1 && input2 && input3) {
            const value1 = input1.value
            const value2 = input2.value
            const result1 = parseFloat(input3.value) || 0
            totalNum += parseFloat(value1)
            totalPrice += result1
            values.push({
              inputOne: value1,
              inputTwo: value2,
              price: result1
            })
          }
        }
        values.push({ totalPrice, totalNum })

        return values
      }
    }).then((data) => {
      if (data.isConfirmed) {
        setDone(true)
        setFormData((prevState) => ({
          ...prevState,
          data: {
            ...prevState.data,
            blanketsPrice: data.value
          }
        }))
      }
    })
  }
  return (
    <input
      style={done ? { border: '2px solid var(--bright-color)' } : {}}
      type="button"
      name="blanketsPrice"
      className="form-control"
      value="اضغط للاضافة"
      onClick={handleBlankets}
    />
  )
})

Blankets.displayName = 'Blankets'
export default Blankets
