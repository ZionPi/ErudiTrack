export const SVG_CODE_TEMPLATE = `<svg width="400" height="550" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#cfd8dc" />
      <stop offset="100%" stop-color="#90a4ae" />
    </linearGradient>
    <filter id="noiseFilter">
      <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="3" seed="lucas-critique" result="noise"/>
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="7" xChannelSelector="R" yChannelSelector="G"/>
    </filter>
  </defs>
  <rect x="0" y="0" width="400" height="550" rx="10" ry="10" fill="url(#bgGradient)" filter="url(#noiseFilter)" />

  <text x="20" y="30" font-size="20" font-weight="bold" fill="#333">卢卡斯批判 (Lucas Critique)</text>
  <line x1="20" y1="40" x2="380" y2="40" stroke="#333" stroke-width="3" />

  <text x="20" y="60" font-size="14" fill="#333">卢卡斯批判是经济学中的一个重要观点，它强调</text>
  <text x="20" y="80" font-size="14" fill="#333">使用基于历史数据的计量经济模型来预测</text>
  <text x="20" y="100" font-size="14" fill="#333">政策变化的效果是不可靠的。</text>

  <text x="20" y="130" font-size="16" font-weight="bold" fill="#333">核心思想:</text>
   <text x="20" y="150" font-size="14" fill="#333">• 人们的行为会根据政策变化进行调整，</text>
   <text x="40" y="170" font-size="14" fill="#333">而基于历史数据的模型无法预测这种调整。</text>
   <text x="20" y="190" font-size="14" fill="#333">•  政策变化会影响人们的预期和行为。</text>

  <text x="20" y="220" font-size="16" font-weight="bold" fill="#333">挑战传统计量经济模型:</text>
 <text x="20" y="240" font-size="14" fill="#333">• 传统模型通常假设人们的行为模式是固定的。</text>
   <text x="20" y="260" font-size="14" fill="#333">•  卢卡斯批判认为这种假设是不成立的。</text>

   <text x="20" y="290" font-size="16" font-weight="bold" fill="#333">对政策制定的影响:</text>
   <text x="20" y="310" font-size="14" fill="#333">•  政策制定者需要考虑政策对人们预期和行为</text>
     <text x="40" y="330" font-size="14" fill="#333">的潜在影响。</text>
      <text x="20" y="350" font-size="14" fill="#333">•  政策评估应该基于结构性模型，而不是</text>
       <text x="40" y="370" font-size="14" fill="#333">简单的历史数据拟合。</text>

<text x="20" y="400" font-size="16" font-weight="bold" fill="#333">强调:</text>
  <text x="20" y="420" font-size="14" fill="#333">卢卡斯批判促使经济学家更加重视微观基础、</text>
    <text x="20" y="440" font-size="14" fill="#333">理性预期和结构性模型在宏观经济分析中的作用。</text>

</svg>`;