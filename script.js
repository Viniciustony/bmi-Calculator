/* ════════════════════════════════════════════════════════════
   script.js — IMC Saúde
   Organização: Dados → Funções puras → DOM → Eventos
════════════════════════════════════════════════════════════ */

/* ── Tabela de classificação OMS ─────────────────────────── */
const CLASSES = [
  { label: 'Abaixo do peso',  seg: 0, color: '#4A9ED6', faixa: 'underweight' },
  { label: 'Peso normal',     seg: 1, color: '#4CAF70', faixa: 'normal'      },
  { label: 'Sobrepeso',       seg: 2, color: '#E8A020', faixa: 'overweight'  },
  { label: 'Obesidade',       seg: 3, color: '#D85A30', faixa: 'obese1'      },
  { label: 'Obesidade grave', seg: 4, color: '#A32D2D', faixa: 'obese2'      },
]

/* ════════════════════════════════════════════════════════════
   FUNÇÕES PURAS
════════════════════════════════════════════════════════════ */

/**
 * Calcula o IMC a partir de peso (kg) e altura (cm).
 * @param {number} weightKg
 * @param {number} heightCm
 * @returns {number}
 */
function calculateBMI(weightKg, heightCm) {
  const heightM = heightCm / 100
  return Math.round((weightKg / (heightM * heightM)) * 100) / 100
}

/**
 * Retorna a classificação OMS para um dado IMC.
 * @param {number} bmi
 * @returns {{ label: string, seg: number, color: string, faixa: string }}
 */
function classify(bmi) {
  if (bmi < 18.5) return CLASSES[0]
  if (bmi < 25)   return CLASSES[1]
  if (bmi < 30)   return CLASSES[2]
  if (bmi < 40)   return CLASSES[3]
  return CLASSES[4]
}

/**
 * Valida os valores brutos do formulário.
 * @param {string} alturaStr
 * @param {string} pesoStr
 * @returns {{ alturaErr: string, pesoErr: string }}
 */
function validateInputs(alturaStr, pesoStr) {
  const errors = { alturaErr: '', pesoErr: '' }
  const altura = parseFloat(alturaStr)
  const peso   = parseFloat(pesoStr)

  if (!alturaStr.trim()) {
    errors.alturaErr = 'Preencha a altura.'
  } else if (isNaN(altura) || altura < 50 || altura > 250) {
    errors.alturaErr = 'Insira uma altura válida (50 – 250 cm).'
  }

  if (!pesoStr.trim()) {
    errors.pesoErr = 'Preencha o peso.'
  } else if (isNaN(peso) || peso < 1 || peso > 500) {
    errors.pesoErr = 'Insira um peso válido (1 – 500 kg).'
  }

  return errors
}

/* ════════════════════════════════════════════════════════════
   FUNÇÕES DE DOM — Formulário
════════════════════════════════════════════════════════════ */

function showFieldError(fieldId, message) {
  document.getElementById(fieldId).classList.add('err')
  document.getElementById(fieldId + '-err').textContent = message
}

function clearErr(fieldId) {
  document.getElementById(fieldId).classList.remove('err')
  document.getElementById(fieldId + '-err').textContent = ''
}

/* ════════════════════════════════════════════════════════════
   FUNÇÕES DE DOM — Resultado
════════════════════════════════════════════════════════════ */

/**
 * Atualiza o painel de resultado com o IMC calculado.
 * @param {number} bmi
 * @param {{ label: string, seg: number, color: string, faixa: string }} cls
 */
function renderResult(bmi, cls) {
  /* Número */
  const numEl = document.getElementById('result-number')
  numEl.textContent = bmi.toFixed(2)
  numEl.style.color = cls.color
  numEl.classList.add('active', 'result-animate')
  numEl.addEventListener('animationend', () => {
    numEl.classList.remove('result-animate')
  }, { once: true })

  /* Label */
  const lblEl = document.getElementById('result-class')
  lblEl.textContent = cls.label
  lblEl.style.color = cls.color

  /* Gauge */
  for (let i = 0; i < 5; i++) {
    const active = i === cls.seg
    document.getElementById('seg' + i).classList.toggle('on', active)
    document.getElementById('lbl' + i).classList.toggle('on', active)
  }

  /* Destaca o card correspondente na seção de faixas */
  highlightCard(cls.faixa)
}

/**
 * Adiciona a classe .highlighted ao card da faixa calculada
 * e remove dos demais. Não há clique — só o cálculo aciona isso.
 * @param {string} faixa
 */
function highlightCard(faixa) {
  document.querySelectorAll('.faixa-card').forEach(card => {
    card.classList.toggle('highlighted', card.dataset.faixa === faixa)
  })
}

/* ════════════════════════════════════════════════════════════
   ORQUESTRADOR
════════════════════════════════════════════════════════════ */

function calcular() {
  const alturaEl = document.getElementById('altura')
  const pesoEl   = document.getElementById('peso')

  const errors = validateInputs(alturaEl.value, pesoEl.value)

  if (errors.alturaErr) showFieldError('altura', errors.alturaErr)
  if (errors.pesoErr)   showFieldError('peso',   errors.pesoErr)
  if (errors.alturaErr || errors.pesoErr) return

  const bmi = calculateBMI(parseFloat(pesoEl.value), parseFloat(alturaEl.value))
  const cls = classify(bmi)

  renderResult(bmi, cls)
}

/* ════════════════════════════════════════════════════════════
   INICIALIZAÇÃO
════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {

  /* Submit do formulário */
  document.getElementById('imc-form').addEventListener('submit', (e) => {
    e.preventDefault()
    calcular()
  })

  /* Enter nos campos */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.target.id === 'altura' || e.target.id === 'peso')) {
      e.preventDefault()
      calcular()
    }
  })

  /* Limpa erros ao digitar — sem oninput no HTML */
  document.getElementById('altura').addEventListener('input', () => clearErr('altura'))
  document.getElementById('peso').addEventListener('input',   () => clearErr('peso'))

})