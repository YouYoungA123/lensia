const typeData = {
  WEPL: { name: '포근한 밀크 브라운 타입', description: '따뜻하고 부드러운 인상을 살려주는 자연스러운 브라운 렌즈를 추천해요.' },
  WEPM: { name: '내추럴 코코아 타입', description: '부담 없는 확대감과 따뜻한 컬러가 어우러진 데일리 렌즈가 잘 어울려요.' },
  WEKL: { name: '선명한 카라멜 캣 타입', description: '따뜻한 카라멜 컬러와 또렷한 테두리로 세련된 눈매를 연출해 보세요.' },
  WEKM: { name: '차분한 허니 캣 타입', description: '은은한 브라운과 자연스러운 직경으로 또렷하지만 편안한 인상을 만들어요.' },
  WUPL: { name: '러블리 코랄 브라운 타입', description: '따뜻한 포인트 컬러와 큰 그래픽으로 사랑스럽고 특별한 분위기를 완성해요.' },
  WUPM: { name: '피치 글로우 타입', description: '코랄빛 포인트와 적당한 확대감으로 화사한 개성을 표현해 보세요.' },
  WUKL: { name: '골든 카라멜 캣 타입', description: '골드와 카라멜 컬러가 조합된 선명한 렌즈로 존재감을 높여보세요.' },
  WUKM: { name: '앰버 시크 타입', description: '앰버 브라운의 유니크함과 자연스러운 직경을 함께 즐기는 타입이에요.' },
  CEPL: { name: '맑은 애쉬 퍼피 타입', description: '차분한 애쉬 컬러와 부드러운 디자인으로 맑고 친근한 인상을 연출해요.' },
  CEPM: { name: '데일리 소프트 그레이 타입', description: '자연스러운 회색빛과 적당한 확대감으로 매일 편하게 착용하기 좋아요.' },
  CEKL: { name: '클리어 그레이 캣 타입', description: '맑은 회색과 또렷한 라인으로 세련되고 선명한 눈매를 만들어 보세요.' },
  CEKM: { name: '모던 애쉬 타입', description: '차분하고 도회적인 애쉬 컬러가 자연스러운 눈매와 잘 어울려요.' },
  CUPL: { name: '라벤더 드림 타입', description: '쿨한 컬러와 큰 직경으로 몽환적이고 사랑스러운 분위기를 연출해요.' },
  CUPM: { name: '미스티 블루 타입', description: '은은한 블루·그레이 컬러로 과하지 않게 특별한 포인트를 더해요.' },
  CUKL: { name: '문라이트 캣 타입', description: '차가운 컬러와 선명한 디자인으로 신비롭고 시크한 인상을 완성해요.' },
  CUKM: { name: '시크 애쉬 바이올렛 타입', description: '애쉬 바이올렛의 개성과 자연스러운 직경을 함께 즐기는 타입이에요.' },
};

function formatTypeCode(code) {
  return `${code.slice(0, 3)}${code[3]}`;
}

function updateResult() {
  const code = typeof getDisplayTypeCode === 'function' ? getDisplayTypeCode() : getTypeCode();
  const data = typeData[code] || typeData.WEPL;
  const full = [
    code[0] === 'W' ? 'Warm' : 'Cool',
    code[1] === 'E' ? 'Everyday' : 'Unique',
    code[2] === 'P' ? 'Puppy' : 'Kitty',
    code[3] === 'L' ? 'Large' : 'Medium',
  ].join(' ');

  document.querySelector('#type-code').textContent = formatTypeCode(code);
  document.querySelector('#type-full').textContent = full;
  document.querySelector('#type-name').textContent = data.name;
  document.querySelector('#type-description').textContent = data.description;

  document.querySelector('#axis-wc').style.left = code[0] === 'W' ? '27%' : '73%';
  document.querySelector('#axis-eu').style.left = code[1] === 'E' ? '27%' : '73%';
  document.querySelector('#axis-pk').style.left = code[2] === 'P' ? '27%' : '73%';
  document.querySelector('#axis-lm').style.left = code[3] === 'L' ? '27%' : '73%';
}
