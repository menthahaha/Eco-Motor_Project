function Footer() {
  try {
    const [formData, setFormData] = React.useState({ name: '', phone: '', comment: '', agree: false });
    const [submitted, setSubmitted] = React.useState(false);
    const [errors, setErrors] = React.useState({ name: '', phone: '', comment: '' });

    const handlePhoneChange = (e) => {
      const formatted = window.ValidationUtils ? window.ValidationUtils.formatPhoneNumber(e.target.value) : e.target.value;
      setFormData({...formData, phone: formatted});
      
      // Валидация в реальном времени (только если номер полный)
      if (formatted.length >= 18) {
        const isValid = window.ValidationUtils ? window.ValidationUtils.validatePhone(formatted) : true;
        setErrors({...errors, phone: isValid ? '' : 'Введите корректный номер телефона'});
      } else if (formatted.length === 0) {
        setErrors({...errors, phone: ''});
      } else {
        // Пока номер вводится, не показываем ошибку
        setErrors({...errors, phone: ''});
      }
    };

    const handleCommentChange = (e) => {
      const value = e.target.value;
      setFormData({...formData, comment: value});
      
      // Валидация в реальном времени
      if (value.length === 0) {
        setErrors({...errors, comment: 'Комментарий обязателен для заполнения'});
      } else if (value.length < 20) {
        setErrors({...errors, comment: `Минимум 20 символов. Осталось: ${20 - value.length}`});
      } else {
        setErrors({...errors, comment: ''});
      }
    };

    const handleNameChange = (e) => {
      let value = e.target.value;
      
      // Фильтруем недопустимые символы (только буквы и пробелы)
      value = window.ValidationUtils ? window.ValidationUtils.filterNameInput(value) : value.replace(/[^а-яА-ЯёЁa-zA-Z\s]/g, '');
      
      setFormData({...formData, name: value});
      
      // Валидация в реальном времени
      if (value.length > 0) {
        const validationResult = window.ValidationUtils ? window.ValidationUtils.validateName(value) : { valid: true, error: '' };
        setErrors({...errors, name: validationResult.valid ? '' : validationResult.error});
      } else {
        setErrors({...errors, name: ''});
      }
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      if (!formData.agree) {
        alert('Необходимо согласие на обработку персональных данных');
        return;
      }
      
      // Финальная валидация имени
      const nameValidation = window.ValidationUtils ? window.ValidationUtils.validateName(formData.name) : { valid: formData.name.trim().length >= 2, error: '' };
      if (!nameValidation.valid) {
        setErrors({...errors, name: nameValidation.error || 'Введите корректное имя'});
        return;
      }
      
      // Финальная валидация телефона
      const phoneValid = window.ValidationUtils ? window.ValidationUtils.validatePhone(formData.phone) : formData.phone.length > 0;
      if (!phoneValid) {
        setErrors({...errors, phone: 'Введите корректный номер телефона'});
        return;
      }
      
      // Валидация комментария
      const commentTrimmed = formData.comment.trim();
      if (commentTrimmed.length === 0) {
        setErrors({...errors, comment: 'Комментарий обязателен для заполнения'});
        return;
      }
      if (commentTrimmed.length < 20) {
        setErrors({...errors, comment: `Минимум 20 символов. Осталось: ${20 - commentTrimmed.length}`});
        return;
      }
      
      // Сохранение данных в localStorage
      const cleanPhone = window.ValidationUtils ? window.ValidationUtils.getCleanPhone(formData.phone) : formData.phone;
      const contactData = {
        name: formData.name.trim(),
        phone: cleanPhone,
        comment: commentTrimmed
      };
      
      // Сохраняем в localStorage, если доступна утилита
      if (window.StorageUtils) {
        const saveResult = window.StorageUtils.saveContactForm(contactData);
        if (saveResult.success) {
          console.log('Contact form saved:', saveResult.contact);
        } else {
          console.error('Error saving contact form:', saveResult.error);
        }
      } else {
        console.log('Form submitted:', contactData);
      }
      
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setFormData({ name: '', phone: '', comment: '', agree: false });
        setErrors({ name: '', phone: '', comment: '' });
      }, 3000);
    };

    return (
      <footer className="bg-[var(--bg-secondary)] border-t border-[var(--border-color)] text-[var(--text-dark)] py-12 transition-colors duration-300" data-name="footer" data-file="components/Footer.js">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Остались вопросы? Пишите нам</h3>
              <p className="text-[var(--text-light)] mb-6">Оставьте заявку и мы свяжемся с Вами в течение часа</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <input 
                    type="text" 
                    placeholder="Ваше имя" 
                    required 
                    className={`w-full px-4 py-3 rounded-full bg-[var(--bg-primary)] text-[var(--text-dark)] border border-[var(--border-color)] ${errors.name ? 'border-2 border-red-500' : ''}`}
                    value={formData.name}
                    onChange={handleNameChange}
                  />
                  {errors.name && (
                    <p className="text-red-400 text-sm mt-1 ml-2">{errors.name}</p>
                  )}
                </div>
                <div>
                  <input 
                    type="tel" 
                    placeholder="+7 (___) ___-__-__" 
                    required 
                    className={`w-full px-4 py-3 rounded-full bg-[var(--bg-primary)] text-[var(--text-dark)] border border-[var(--border-color)] ${errors.phone ? 'border-2 border-red-500' : ''}`}
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    maxLength="18"
                  />
                  {errors.phone && (
                    <p className="text-red-400 text-sm mt-1 ml-2">{errors.phone}</p>
                  )}
                </div>
                <div>
                  <textarea 
                    placeholder="Комментарий (минимум 20 символов)" 
                    rows="3" 
                    required
                    className={`w-full px-4 py-3 rounded-2xl bg-[var(--bg-primary)] text-[var(--text-dark)] border border-[var(--border-color)] ${errors.comment ? 'border-2 border-red-500' : ''}`}
                    value={formData.comment}
                    onChange={handleCommentChange}
                    minLength="20"
                  ></textarea>
                  <div className="flex justify-between items-center mt-1">
                    <div className="flex-1">
                      {errors.comment && (
                        <p className="text-red-400 text-sm ml-2">{errors.comment}</p>
                      )}
                    </div>
                    <p className={`text-sm font-semibold ${formData.comment.length < 20 ? 'text-gray-400' : 'text-green-400'}`}>
                      {formData.comment.length}/20
                    </p>
                  </div>
                </div>
                <label className="flex items-start space-x-2 text-sm">
                  <input type="checkbox" required className="mt-1" onChange={(e) => setFormData({...formData, agree: e.target.checked})} />
                  <span>Я выражаю согласие на передачу и обработку персональных данных в соответствии с Политикой конфиденциальности *</span>
                </label>
                <button type="submit" className="btn-secondary">{submitted ? 'Отправлено!' : 'Отправить'}</button>
              </form>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-[var(--text-light)]">Copyright © 2022 - 2025 ООО "ЭКО-МОТОР"</p>
              <a href="privacy.html" className="block text-[var(--text-light)] hover:text-[var(--primary-color)] transition-colors">Политика конфиденциальности</a>
              <a href="tel:+74965496150" className="flex items-center space-x-2 text-lg font-semibold text-[var(--text-dark)] hover:text-[var(--secondary-color)] transition-colors">
                <div className="icon-phone text-xl"></div>
                <span>+7 (496) 549-61-50</span>
              </a>
              <div className="flex items-start space-x-2 text-[var(--text-dark)]">
                <div className="icon-map-pin text-xl mt-1"></div>
                <span>г. Пересвет, ул. Гагарина д. 5А</span>
              </div>
              <div>
                <p className="font-semibold mb-2">МЫ В СОЦИАЛЬНЫХ СЕТЯХ</p>
                <div className="flex space-x-4">
                  <a href="https://wa.me/74965496150" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center hover:bg-green-600 transition-colors" title="Написать в WhatsApp">
                    <div className="icon-message-circle text-xl text-white"></div>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    );
  } catch (error) {
    console.error('Footer component error:', error);
    return null;
  }
}

