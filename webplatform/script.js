document.addEventListener("DOMContentLoaded", async () => {
  const advertisement = document.getElementById("advertisement");
  const backgroundImage = document.getElementById("brand-screenshot");
  const closeBtn = document.getElementById("close-popup");
  const form = document.getElementById("ad-form");
  const titleElement = document.getElementById("form-title");
  const descriptionElement = document.getElementById("form-description");

  let redirectUrl = "https://www.example.com";
  let sheetUrl = "";
  let testCaseId = "";
  let isUploadMode = false;
  let isDownloadMode = false;
  let downloadData = null;

  advertisement.classList.remove("hidden");
  backgroundImage.style.opacity = "0.02";

  closeBtn.addEventListener("click", () => {
    advertisement.classList.add("hidden");
    backgroundImage.style.opacity = "1";
  });

  function getFormConfigFilename() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    return id ? `${id}.json` : "default.json";
  }

  async function loadFormFromJSON(jsonFilename) {
    form.innerHTML = "";

    try {
      const response = await fetch(jsonFilename);
      const config = await response.json();

      document.title = config.title || "Untitled Form";
      titleElement.textContent = config.title || "Untitled Form";
      descriptionElement.textContent = config.description || "";

      if (config.backgroundImage) backgroundImage.src = config.backgroundImage;
      if (config.redirectUrl) redirectUrl = config.redirectUrl;
      if (config.sheetUrl) sheetUrl = config.sheetUrl;
      if (config.test_case_id) testCaseId = config.test_case_id;

      if (
        Array.isArray(config.fields) &&
        config.fields.length === 1 &&
        config.fields[0].type === "file"
      ) {
        isUploadMode = true;
      }

      if (config.download && config.download.url) {
        isDownloadMode = true;
        downloadData = config.download;
      }

      // Render form or download button
      if (isDownloadMode) {
        const downloadButton = document.createElement("button");
        downloadButton.type = "submit";
        downloadButton.textContent = "Download File";
        form.appendChild(downloadButton);
      } else if (Array.isArray(config.fields)) {
        config.fields.forEach((field) => {
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

        const submitButton = document.createElement("button");
        submitButton.type = "submit";
        submitButton.textContent = isUploadMode ? "Upload" : "Submit";
        form.appendChild(submitButton);
      }

    } catch (err) {
      titleElement.textContent = "Error";
      descriptionElement.textContent = `Unable to load form config from "${jsonFilename}"`;
      console.error("Failed to load form config:", err);
    }
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // DOWNLOAD MODE
    if (isDownloadMode) {
      const payload = {
        test_case_id: testCaseId,
        first_infor: "",
        second_infor: "",
        filename: downloadData.filename || "",
        mimetype: downloadData.mimetype || ""
      };

      try {
        await fetch(sheetUrl, {
          method: "POST",
          mode: "no-cors",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        });
      } catch (err) {
        console.error("Failed to log download:", err);
      }

      const link = document.createElement("a");
      link.href = downloadData.url;
      link.download = downloadData.filename || "downloaded_file";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.location.href = redirectUrl;
      return;
    }

    // UPLOAD MODE
    if (isUploadMode) {
      const fileInput = form.querySelector('input[type="file"]');
      const file = fileInput?.files?.[0];
      if (!file) return alert("Please select a file to upload.");

      const reader = new FileReader();
      reader.onload = async () => {
        const base64Content = reader.result.split(",")[1];

        const payload = {
          test_case_id: testCaseId,
          first_infor: "",
          second_infor: "",
          filename: file.name,
          mimetype: file.type,
          content: base64Content
        };

        try {
          await fetch(sheetUrl, {
            method: "POST",
            mode: "no-cors",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
          });
          alert("File uploaded successfully.");
        } catch (err) {
          console.error("Upload failed:", err);
          alert("Failed to upload file.");
        }

        window.location.href = redirectUrl;
      };

      reader.readAsDataURL(file);
      return;
    }

    // FORM MODE
    const data = {};
    Array.from(form.elements).forEach((el) => {
      if (el.name) {
        data[el.name] = el.value.trim();
      }
    });

    data.test_case_id = testCaseId;
    data.filename = "";
    data.mimetype = "";

    try {
      await fetch(sheetUrl, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });
      alert("Form submitted successfully.");
    } catch (err) {
      console.error("Submit error:", err);
      alert("Failed to submit form.");
    }

    window.location.href = redirectUrl;
  });

  const jsonFile = getFormConfigFilename();
  await loadFormFromJSON(jsonFile);
});
