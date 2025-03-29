document.addEventListener("DOMContentLoaded", async () => {
    const advertisement = document.getElementById("advertisement");
    const backgroundImage = document.querySelector(".amazon-screenshot");
    const closeBtn = document.getElementById("close-popup");
    const form = document.getElementById("ad-form");
    const titleElement = document.getElementById("form-title");
    const descriptionElement = document.getElementById("form-description");
  
    // Hiện popup
    advertisement.classList.remove("hidden");
    backgroundImage.style.opacity = "0";
  
    // Đóng popup khi nhấn nút X
    closeBtn.addEventListener("click", () => {
      advertisement.classList.add("hidden");
      backgroundImage.style.opacity = "1";
    });
  
    // Hàm lấy tên file JSON từ URL (?id=xxx)
    function getFormConfigFilename() {
      const params = new URLSearchParams(window.location.search);
      const id = params.get('id');
      return id ? `${id}.json` : 'default.json';
    }
  
    // Load file JSON và render tiêu đề, mô tả, form
    async function loadFormFromJSON(jsonFilename) {
      form.innerHTML = "";
  
      try {
        const response = await fetch(jsonFilename);
        const config = await response.json();
  
        // Set title & description từ JSON
        titleElement.textContent = config.title || "Untitled Form";
        descriptionElement.textContent = config.description || "";
  
        // Tạo các input field
        if (Array.isArray(config.fields)) {
          config.fields.forEach(field => {
            const label = document.createElement("label");
            label.setAttribute("for", field.id);
            label.textContent = field.label;
  
            const input = document.createElement("input");
            input.type = field.type || "text";
            input.id = field.id;
            input.name = field.name;
            if (field.required) input.required = true;
  
            form.appendChild(label);
            form.appendChild(input);
          });
        }
  
        // Thêm nút Submit
        const submitButton = document.createElement("button");
        submitButton.type = "submit";
        submitButton.textContent = "Submit";
        form.appendChild(submitButton);
  
      } catch (err) {
        titleElement.textContent = "Error";
        descriptionElement.textContent = `Unable to load form config from "${jsonFilename}"`;
        console.error("Failed to load form config:", err);
      }
    }
  
    // Xử lý khi người dùng submit form
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = {};
      Array.from(form.elements).forEach(el => {
        if (el.name) {
          data[el.name] = el.value.trim();
        }
      });
      console.log("Form submitted:", data);
      alert("Success! Continue your shopping journey on Amazon.com and enjoy special deals just for you.");
    //   advertisement.classList.add("hidden");
    //   backgroundImage.style.opacity = "1";
    window.location.href = "https://www.amazon.com"; // ✅ Redirect
    });
  
    // Chạy hàm khởi tạo
    const jsonFile = getFormConfigFilename();
    await loadFormFromJSON(jsonFile);
  });
  