document.addEventListener('DOMContentLoaded', () => {
  // === ESTADO E DADOS GLOBAIS ===
  // Usando localStorage para o carrinho persistir entre a página inicial e a página de produtos
  let cart = JSON.parse(localStorage.getItem('piratas_cart')) || [];
  let shippingCost = 0;
  const WHATSAPP_NUMBER = "5511999999999"; 

  // Simulador de Banco de Dados de Produtos
  const PRODUCTS_DB = {
    '1': { id: '1', name: 'Predator Popper 90', price: 59.90, img: 'assets/lure1.png', category: 'Superfície', desc: 'A isca de superfície ideal para levantar os maiores predadores. Ação popper com grande deslocamento de água.' },
    '2': { id: '2', name: 'Deep Diver Ghost', price: 64.50, img: 'assets/lure2.png', category: 'Meia-Água', desc: 'Atinge até 3 metros de profundidade. Pintura translúcida e rattlin interno para atrair peixes manhosos.' },
    '3': { id: '3', name: 'Predator Popper 90 - Green', price: 59.90, img: 'assets/lure1.png', category: 'Superfície', desc: 'Versão verde com detalhes refletivos, perfeita para dias ensolarados e águas claras.' },
    '4': { id: '4', name: 'Deep Diver Shadow', price: 64.50, img: 'assets/lure2.png', category: 'Meia-Água', desc: 'Cores escuras para pescaria em dias nublados ou águas mais turvas.' }
  };

  // === ELEMENTOS DO DOM ===
  const cartCountBadge = document.getElementById('cart-count-badge');
  const cartModal = document.getElementById('cart-modal');
  const cartOverlay = document.getElementById('cart-overlay');
  const openCartBtn = document.getElementById('open-cart-btn');
  const closeCartBtn = document.getElementById('close-cart-btn');
  const cartItemsContainer = document.getElementById('cart-items');
  const cartSubtotalEl = document.getElementById('cart-subtotal');
  const cartShippingCostEl = document.getElementById('cart-shipping-cost');
  const cartTotalEl = document.getElementById('cart-total');
  const checkoutBtn = document.getElementById('checkout-whatsapp-btn');
  const cepInput = document.getElementById('cep-input');
  const calcShippingBtn = document.getElementById('calc-shipping-btn');
  const shippingResult = document.getElementById('shipping-result');
  const chatFab = document.getElementById('chat-fab');
  const chatWindow = document.getElementById('chat-window');
  const closeChatBtn = document.getElementById('close-chat-btn');
  const chatMessages = document.getElementById('chat-messages');
  const chatInput = document.getElementById('chat-input');
  const sendChatBtn = document.getElementById('send-chat-btn');

  const addToCartBtns = document.querySelectorAll('.add-to-cart-btn');

  // === FUNÇÕES AUXILIARES ===
  const formatMoney = (value) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const saveCart = () => {
    localStorage.setItem('piratas_cart', JSON.stringify(cart));
  };

  // === FUNÇÕES DE CARRINHO ===
  const openCart = () => {
    if(cartModal) cartModal.classList.add('active');
    if(cartOverlay) cartOverlay.classList.add('active');
  };

  const closeCart = () => {
    if(cartModal) cartModal.classList.remove('active');
    if(cartOverlay) cartOverlay.classList.remove('active');
  };

  if(openCartBtn) openCartBtn.addEventListener('click', openCart);
  if(closeCartBtn) closeCartBtn.addEventListener('click', closeCart);
  if(cartOverlay) cartOverlay.addEventListener('click', closeCart);

  const updateCartUI = () => {
    if(!cartItemsContainer) return; // Se não estiver na página com carrinho carregado
    
    // Calcula quantidade total de itens (somando a qtd de cada)
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if(cartCountBadge) cartCountBadge.textContent = totalItems;
    
    if (cart.length === 0) {
      cartItemsContainer.innerHTML = '<div class="empty-cart">Seu carrinho está vazio</div>';
      checkoutBtn.disabled = true;
      cartSubtotalEl.textContent = 'R$ 0,00';
      cartTotalEl.textContent = 'R$ 0,00';
      shippingCost = 0;
      cartShippingCostEl.textContent = 'R$ 0,00';
      if(shippingResult) shippingResult.textContent = '';
      if(cepInput) cepInput.value = '';
      return;
    }

    checkoutBtn.disabled = false;
    cartItemsContainer.innerHTML = '';
    
    let subtotal = 0;

    cart.forEach((item, index) => {
      const itemTotal = item.price * item.quantity;
      subtotal += itemTotal;
      
      const itemEl = document.createElement('div');
      itemEl.className = 'cart-item';
      itemEl.innerHTML = `
        <img src="${item.img}" alt="${item.name}">
        <div class="cart-item-info">
          <div class="cart-item-title">${item.name}</div>
          <div class="cart-item-price">${formatMoney(item.price)}</div>
          
          <div class="cart-qty-controls">
            <button class="qty-btn decrement" data-index="${index}">-</button>
            <span class="qty-value">${item.quantity}</span>
            <button class="qty-btn increment" data-index="${index}">+</button>
          </div>
        </div>
        <div class="cart-item-total">
          <button class="remove-item-btn" data-index="${index}"><i class="fas fa-trash"></i></button>
          <div class="item-total-price">${formatMoney(itemTotal)}</div>
        </div>
      `;
      cartItemsContainer.appendChild(itemEl);
    });

    // Event listeners para + e - e Lixeira
    document.querySelectorAll('.qty-btn.increment').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.currentTarget.getAttribute('data-index'));
        cart[idx].quantity += 1;
        saveCart();
        updateCartUI();
      });
    });

    document.querySelectorAll('.qty-btn.decrement').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.currentTarget.getAttribute('data-index'));
        if (cart[idx].quantity > 1) {
          cart[idx].quantity -= 1;
          saveCart();
          updateCartUI();
        } else {
          removeFromCart(idx);
        }
      });
    });

    document.querySelectorAll('.remove-item-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.currentTarget.getAttribute('data-index'));
        removeFromCart(idx);
      });
    });

    cartSubtotalEl.textContent = formatMoney(subtotal);
    const total = subtotal + shippingCost;
    cartTotalEl.textContent = formatMoney(total);
  };

  const addToCart = (id, name, price, img, quantity = 1) => {
    // Verifica se já existe
    const existingItem = cart.find(item => item.id === id);
    if (existingItem) {
      existingItem.quantity += parseInt(quantity);
    } else {
      cart.push({ id, name, price: parseFloat(price), img, quantity: parseInt(quantity) });
    }
    saveCart();
    updateCartUI();
    openCart();
  };

  // Botões de Adicionar ao Carrinho no Catálogo (index.html)
  addToCartBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault(); // Previne click no link caso esteja dentro do <a>
      const id = btn.getAttribute('data-id');
      const name = btn.getAttribute('data-name');
      const price = btn.getAttribute('data-price');
      const img = btn.getAttribute('data-img');

      addToCart(id, name, price, img, 1);
      
      // Feedback visual
      const originalIcon = btn.innerHTML;
      btn.innerHTML = '<i class="fas fa-check"></i>';
      btn.style.backgroundColor = '#4caf50';
      btn.style.borderColor = '#4caf50';
      btn.style.color = 'white';
      
      setTimeout(() => {
        btn.innerHTML = originalIcon;
        btn.style = '';
      }, 1000);
    });
  });

  const removeFromCart = (index) => {
    cart.splice(index, 1);
    saveCart();
    updateCartUI();
  };

  // === FRETE ===
  if(calcShippingBtn) {
    calcShippingBtn.addEventListener('click', () => {
      const cep = cepInput.value.replace(/\D/g, '');
      if (cep.length !== 8) {
        shippingResult.textContent = 'Por favor, digite um CEP válido com 8 dígitos.';
        shippingResult.style.color = '#e63946';
        return;
      }
      shippingResult.textContent = 'Calculando...';
      shippingResult.style.color = 'var(--color-text-muted)';
      
      setTimeout(() => {
        shippingCost = Math.floor(Math.random() * 20) + 15;
        shippingResult.innerHTML = `Frete (PAC) para ${cepInput.value}: <strong>${formatMoney(shippingCost)}</strong>`;
        shippingResult.style.color = '#4caf50';
        cartShippingCostEl.textContent = formatMoney(shippingCost);
        updateCartUI();
      }, 800);
    });
  }

  if(cepInput) {
    cepInput.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\D/g, '');
      if (value.length > 5) {
        value = value.replace(/^(\d{5})(\d)/, '$1-$2');
      }
      e.target.value = value;
    });
  }

  // === CHECKOUT WHATSAPP ===
  if(checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      if (cart.length === 0) return;

      let subtotal = 0;
      let message = "🎣 *Novo Pedido - Piratas Fishing* 🎣\n\n";
      message += "*Itens do Pedido:*\n";
      
      cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        message += `- ${item.quantity}x ${item.name} (${formatMoney(itemTotal)})\n`;
        subtotal += itemTotal;
      });

      message += `\n*Subtotal:* ${formatMoney(subtotal)}\n`;
      
      if (shippingCost > 0) {
        message += `*Frete (CEP ${cepInput.value}):* ${formatMoney(shippingCost)}\n`;
      } else {
        message += `*Frete:* A calcular\n`;
      }
      
      const total = subtotal + shippingCost;
      message += `\n*TOTAL:* ${formatMoney(total)}\n\n`;
      message += "Olá! Gostaria de finalizar a compra deste pedido.";

      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
      
      window.open(whatsappUrl, '_blank');
    });
  }

  // === CHAT IA ===
  if(chatFab) {
    chatFab.addEventListener('click', () => chatWindow.classList.add('active'));
    closeChatBtn.addEventListener('click', () => chatWindow.classList.remove('active'));

    const sendMessage = () => {
      const text = chatInput.value.trim();
      if (!text) return;

      const userMsgEl = document.createElement('div');
      userMsgEl.className = 'message user-message';
      userMsgEl.textContent = text;
      chatMessages.appendChild(userMsgEl);
      
      chatInput.value = '';
      chatMessages.scrollTop = chatMessages.scrollHeight;

      setTimeout(() => {
        const aiMsgEl = document.createElement('div');
        aiMsgEl.className = 'message ai-message';
        const lowerText = text.toLowerCase();
        if (lowerText.includes('frete') || lowerText.includes('entrega')) {
          aiMsgEl.textContent = 'Enviamos para todo o Brasil! Você pode calcular o prazo no carrinho.';
        } else {
          aiMsgEl.textContent = 'Este é um mockup, mas posso ser integrado à sua IA oficial de atendimento em breve!';
        }
        chatMessages.appendChild(aiMsgEl);
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }, 1000);
    };

    sendChatBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendMessage();
    });
  }

  // === PÁGINA DO PRODUTO (product.html) ===
  const initProductPage = () => {
    // Checa se estamos na página do produto pelo elemento chave
    const productDetailContainer = document.getElementById('product-detail-container');
    if (!productDetailContainer) return;

    // Pegar o ID da URL (?id=X)
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    const product = PRODUCTS_DB[productId];

    if (!product) {
      productDetailContainer.innerHTML = '<h2>Produto não encontrado.</h2><a href="index.html" class="btn-primary" style="margin-top: 1rem;">Voltar</a>';
      return;
    }

    // Preencher a UI com os dados do produto
    document.getElementById('pd-image').src = product.img;
    // Se for o item verde ou shadow, aplicar o mesmo filtro CSS
    if(product.id === '3') document.getElementById('pd-image').style.filter = 'hue-rotate(120deg)';
    if(product.id === '4') document.getElementById('pd-image').style.filter = 'grayscale(80%) brightness(0.6)';

    document.getElementById('pd-category').textContent = product.category;
    document.getElementById('pd-title').textContent = product.name;
    document.getElementById('pd-price').textContent = formatMoney(product.price);
    document.getElementById('pd-desc').textContent = product.desc;
    
    // Breadcrumb
    document.getElementById('bc-category').textContent = product.category;
    document.getElementById('bc-product').textContent = product.name;

    // Controle de Quantidade na página do produto
    const qtyInput = document.getElementById('pd-qty-input');
    
    // Quick Add Buttons (10, 15, 20)
    document.querySelectorAll('.quick-qty-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        qtyInput.value = btn.getAttribute('data-val');
      });
    });

    document.getElementById('pd-qty-minus').addEventListener('click', () => {
      if(qtyInput.value > 1) qtyInput.value = parseInt(qtyInput.value) - 1;
    });

    document.getElementById('pd-qty-plus').addEventListener('click', () => {
      qtyInput.value = parseInt(qtyInput.value) + 1;
    });

    // Adicionar ao Carrinho
    document.getElementById('pd-add-to-cart').addEventListener('click', () => {
      const qty = parseInt(qtyInput.value) || 1;
      addToCart(product.id, product.name, product.price, product.img, qty);
    });
  };

  // Inicializações
  updateCartUI(); // Roda em todas as páginas
  initProductPage(); // Só roda se estiver no product.html
});
