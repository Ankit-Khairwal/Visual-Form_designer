document.addEventListener("DOMContentLoaded", function () {
  let formData = [];

  const formElementsContainer = document.getElementById("form-elements");
  const emptyState = document.getElementById("empty-state");
  const toolButtons = document.querySelectorAll(".tool-btn");
  const saveFormButton = document.getElementById("save-form");
  const editModal = document.getElementById("edit-modal");
  const dataModal = document.getElementById("data-modal");
  const closeModal = document.querySelector(".close-modal");
  const closeDataModalBtn = document.querySelector(".close-data-modal");
  const updateElementButton = document.getElementById("update-element");
  const cancelEditButton = document.getElementById("cancel-edit");
  const editFormContainer = document.getElementById("edit-form-container");
  const themeToggle = document.getElementById("theme-toggle");
  const showDataButton = document.getElementById("show-data");
  const clearDataButton = document.getElementById("clear-data");
  const copyDataButton = document.getElementById("copy-data");
  const closeDataButton = document.getElementById("close-data");
  const jsonDisplay = document.getElementById("json-display");

  let currentEditElement = null;

  function initTheme() {
    const savedTheme = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);
    updateThemeIcon(savedTheme);
  }

  function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "light" ? "dark" : "light";

    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);

    updateThemeIcon(newTheme);
    showNotification(
      `${newTheme.charAt(0).toUpperCase() + newTheme.slice(1)} theme activated!`
    );
  }

  function updateThemeIcon(theme) {
    const themeIcon = themeToggle.querySelector("i");

    if (theme === "dark") {
      themeIcon.classList.remove("fa-moon");
      themeIcon.classList.add("fa-sun");
    } else {
      themeIcon.classList.remove("fa-sun");
      themeIcon.classList.add("fa-moon");
    }
  }

  const sortable = new Sortable(formElementsContainer, {
    animation: 150,
    ghostClass: "sortable-ghost",
    onEnd: function (evt) {
      const newIndex = evt.newIndex;
      const oldIndex = evt.oldIndex;

      if (newIndex !== oldIndex) {
        const movedItem = formData.splice(oldIndex, 1)[0];
        formData.splice(newIndex, 0, movedItem);
      }
    },
  });
  function generateUUID() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  }

  function toggleEmptyState() {
    if (formData.length === 0) {
      emptyState.style.display = "flex";
    } else {
      emptyState.style.display = "none";
    }
  }

  function renderFormElements() {
    try {
      const elements = formElementsContainer.querySelectorAll(".form-element");
      elements.forEach((el) => el.remove());

      toggleEmptyState();

      if (!Array.isArray(formData) || formData.length === 0) {
        return;
      }

      formData.forEach((element) => {
        if (!element || !element.type || !element.id) {
          console.warn("Invalid form element:", element);
          return;
        }

        const templateId = `${element.type}-template`;
        const template = document.getElementById(templateId);

        if (!template) {
          console.warn(`Template not found for type: ${element.type}`);
          return;
        }

        const clone = document.importNode(template.content, true);
        const formElement = clone.querySelector(".form-element");
        formElement.dataset.id = element.id;

        const label = clone.querySelector("label");
        if (label) {
          label.textContent = element.label || "";
        }

        if (element.type === "input") {
          const input = clone.querySelector("input");
          if (input) {
            input.placeholder = element.placeholder || "";
            input.value = element.value || "";
            input.addEventListener("input", (e) => {
              element.value = e.target.value;
              saveForm();
            });
          }
        } else if (element.type === "textarea") {
          const textarea = clone.querySelector("textarea");
          if (textarea) {
            textarea.placeholder = element.placeholder || "";
            textarea.value = element.value || "";
            textarea.addEventListener("input", (e) => {
              element.value = e.target.value;
              saveForm();
            });
          }
        } else if (element.type === "select") {
          const select = clone.querySelector("select");
          if (select) {
            select.innerHTML = "";

            if (Array.isArray(element.options)) {
              element.options.forEach((option) => {
                const optionEl = document.createElement("option");
                optionEl.textContent = option;
                optionEl.value = option;
                if (option === element.value) {
                  optionEl.selected = true;
                }
                select.appendChild(optionEl);
              });
            }
            select.addEventListener("change", (e) => {
              element.value = e.target.value;
              saveForm();
            });
          }
        } else if (element.type === "checkbox") {
          const checkbox = clone.querySelector('input[type="checkbox"]');
          const checkboxLabel = clone.querySelector("label");

          if (checkbox && checkboxLabel) {
            checkbox.id = `checkbox-${element.id}`;
            checkboxLabel.setAttribute("for", `checkbox-${element.id}`);
            checkboxLabel.textContent = element.label || "";
            checkbox.checked = element.checked || false;
            checkbox.addEventListener("change", (e) => {
              element.checked = e.target.checked;
              saveForm();
            });
          }
        }

        const editButton = clone.querySelector(".edit-btn");
        const deleteButton = clone.querySelector(".delete-btn");

        if (editButton) {
          editButton.addEventListener("click", () => {
            openEditModal(element);
          });
        }

        if (deleteButton) {
          deleteButton.addEventListener("click", () => {
            deleteElement(element.id);
          });
        }

        formElementsContainer.appendChild(clone);
      });
    } catch (error) {
      console.error("Error rendering form elements:", error);
      showNotification("Error rendering form. Please refresh the page.");
    }
  }

  function addFormElement(type) {
    const newElement = {
      id: generateUUID(),
      type: type,
      label: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
    };

    if (type === "input" || type === "textarea") {
      newElement.placeholder = "Enter a placeholder";
    } else if (type === "select") {
      newElement.options = ["Option 1", "Option 2", "Option 3"];
    }

    formData.push(newElement);
    renderFormElements();

    const newElementEl = formElementsContainer.querySelector(
      `[data-id="${newElement.id}"]`
    );
    newElementEl.classList.add("highlight-new");
    setTimeout(() => {
      newElementEl.classList.remove("highlight-new");
    }, 1000);
  }

  function deleteElement(elementId) {
    const elementIndex = formData.findIndex(
      (element) => element.id === elementId
    );
    if (elementIndex !== -1) {
      const elementEl = formElementsContainer.querySelector(
        `[data-id="${elementId}"]`
      );
      elementEl.classList.add("fade-out");

      setTimeout(() => {
        formData = formData.filter((element) => element.id !== elementId);
        renderFormElements();
      }, 300);
    }
  }

  function openEditModal(element) {
    currentEditElement = element;

    let modalContent = "";

    if (element.type === "input" || element.type === "textarea") {
      modalContent = `
                <div class="form-group">
                    <label for="edit-label">Label</label>
                    <input type="text" id="edit-label" value="${element.label}">
                </div>
                <div class="form-group">
                    <label for="edit-placeholder">Placeholder</label>
                    <input type="text" id="edit-placeholder" value="${
                      element.placeholder || ""
                    }">
                </div>
            `;
    } else if (element.type === "select") {
      let optionsHTML = "";
      element.options.forEach((option, index) => {
        optionsHTML += `
                    <div class="option-item">
                        <input type="text" value="${option}" class="option-value" data-index="${index}">
                        <button class="remove-option-btn" data-index="${index}">×</button>
                    </div>
                `;
      });

      modalContent = `
                <div class="form-group">
                    <label for="edit-label">Label</label>
                    <input type="text" id="edit-label" value="${element.label}">
                </div>
                <div class="form-group">
                    <label>Options</label>
                    <div class="select-options">
                        ${optionsHTML}
                    </div>
                    <button class="add-option-btn"><i class="fas fa-plus"></i> Add Option</button>
                </div>
            `;
    } else if (element.type === "checkbox") {
      modalContent = `
                <div class="form-group">
                    <label for="edit-label">Label</label>
                    <input type="text" id="edit-label" value="${element.label}">
                </div>
            `;
    }

    editFormContainer.innerHTML = modalContent;

    if (element.type === "select") {
      const addOptionBtn = editFormContainer.querySelector(".add-option-btn");
      addOptionBtn.addEventListener("click", addSelectOption);

      const removeOptionBtns =
        editFormContainer.querySelectorAll(".remove-option-btn");
      removeOptionBtns.forEach((btn) => {
        btn.addEventListener("click", removeSelectOption);
      });
    }

    editModal.style.display = "block";
    setTimeout(() => {
      editModal.querySelector(".modal-content").classList.add("show-modal");
    }, 10);
  }

  function closeEditModal() {
    const modalContent = editModal.querySelector(".modal-content");
    modalContent.classList.remove("show-modal");

    setTimeout(() => {
      editModal.style.display = "none";
      currentEditElement = null;
      editFormContainer.innerHTML = "";
    }, 300);
  }

  function addSelectOption() {
    const selectOptions = editFormContainer.querySelector(".select-options");
    const optionIndex = selectOptions.children.length;

    const optionItem = document.createElement("div");
    optionItem.className = "option-item";
    optionItem.innerHTML = `
            <input type="text" value="New Option" class="option-value" data-index="${optionIndex}">
            <button class="remove-option-btn" data-index="${optionIndex}">×</button>
        `;

    selectOptions.appendChild(optionItem);

    const removeBtn = optionItem.querySelector(".remove-option-btn");
    removeBtn.addEventListener("click", removeSelectOption);

    optionItem.classList.add("highlight-new");
    setTimeout(() => {
      optionItem.classList.remove("highlight-new");
    }, 1000);
  }

  function removeSelectOption(event) {
    const index = event.target.dataset.index;
    const optionItem = event.target.closest(".option-item");

    optionItem.classList.add("fade-out");

    setTimeout(() => {
      optionItem.remove();

      const optionItems = editFormContainer.querySelectorAll(".option-item");
      optionItems.forEach((item, idx) => {
        const input = item.querySelector(".option-value");
        const removeBtn = item.querySelector(".remove-option-btn");

        input.dataset.index = idx;
        removeBtn.dataset.index = idx;
      });
    }, 300);
  }

  function updateElement() {
    if (!currentEditElement) return;

    const editLabel = document.getElementById("edit-label");

    if (editLabel) {
      currentEditElement.label = editLabel.value;
    }

    if (
      currentEditElement.type === "input" ||
      currentEditElement.type === "textarea"
    ) {
      const editPlaceholder = document.getElementById("edit-placeholder");
      if (editPlaceholder) {
        currentEditElement.placeholder = editPlaceholder.value;
      }
    } else if (currentEditElement.type === "select") {
      const optionValues = editFormContainer.querySelectorAll(".option-value");
      currentEditElement.options = Array.from(optionValues).map(
        (input) => input.value
      );
    }

    renderFormElements();
    closeEditModal();

    showNotification("Element updated successfully!");
  }

  function saveForm() {
    try {
      const jsonData = JSON.stringify(formData, null, 2);
      localStorage.setItem("formData", jsonData);
      console.log("Form data saved:", jsonData);
      showNotification("Form saved successfully!");
    } catch (error) {
      console.error("Error saving form data:", error);
      showNotification("Error saving form data. Please try again.");
    }
  }

  function showNotification(message) {
    let notification = document.querySelector(".notification");

    if (!notification) {
      notification = document.createElement("div");
      notification.className = "notification";
      document.body.appendChild(notification);
    }

    notification.textContent = message;
    notification.classList.add("show");

    setTimeout(() => {
      notification.classList.remove("show");
    }, 3000);
  }

  function loadSavedFormData() {
    const savedData = localStorage.getItem("formData");
    console.log("Saved form data:", savedData);

    if (savedData && savedData.trim() !== "") {
      try {
        const parsedData = JSON.parse(savedData);
        console.log("Parsed form data:", parsedData);

        if (Array.isArray(parsedData) && parsedData.length > 0) {
          formData = parsedData;
          renderFormElements();
        } else {
          console.log("Saved data is empty or invalid");
          formData = [];
          toggleEmptyState();
        }
      } catch (error) {
        console.error("Error parsing saved form data:", error);

        formData = [];
        localStorage.removeItem("formData");
        toggleEmptyState();
        showNotification("Error loading saved data. Starting with empty form.");
      }
    } else {
      console.log("No saved form data found");
      formData = [];
      toggleEmptyState();
    }
  }
  function showDataModal() {
    try {
      const displayData = formData.map((element) => {
        const cleanElement = {
          type: element.type,
          label: element.label,
        };

        if (element.type === "input" || element.type === "textarea") {
          cleanElement.placeholder = element.placeholder;
          cleanElement.value = element.value || "";
        } else if (element.type === "select") {
          cleanElement.options = element.options;
          cleanElement.value = element.value || "";
        } else if (element.type === "checkbox") {
          cleanElement.checked = element.checked || false;
        }

        return cleanElement;
      });

      const formattedData = JSON.stringify(displayData, null, 2);

      const highlightedData = formattedData
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"(\w+)":/g, '<span class="key">"$1":</span>')
        .replace(/"([^"]+)"(?!:)/g, '<span class="string">"$1"</span>')
        .replace(/\b(true|false)\b/g, '<span class="boolean">$1</span>')
        .replace(/\b(\d+)\b/g, '<span class="number">$1</span>');

      jsonDisplay.innerHTML = highlightedData;

      dataModal.style.display = "block";
      setTimeout(() => {
        dataModal.querySelector(".modal-content").classList.add("show-modal");
      }, 10);
    } catch (error) {
      console.error("Error displaying form data:", error);
      showNotification("Error displaying form data. Please try again.");
    }
  }

  function closeDataModal() {
    const modalContent = dataModal.querySelector(".modal-content");
    modalContent.classList.remove("show-modal");
    setTimeout(() => {
      dataModal.style.display = "none";
    }, 300);
  }

  // Copy data to clipboard
  function copyDataToClipboard() {
    try {
      const displayData = formData.map((element) => {
        const cleanElement = { ...element };
        delete cleanElement.id;
        return cleanElement;
      });

      const data = JSON.stringify(displayData, null, 2);
      navigator.clipboard
        .writeText(data)
        .then(() => {
          showNotification("Data copied to clipboard!");
          const copyBtn = document.getElementById("copy-data");
          copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
          setTimeout(() => {
            copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy';
          }, 2000);
        })
        .catch((err) => {
          console.error("Failed to copy:", err);
          showNotification("Failed to copy data. Please try again.");
        });
    } catch (error) {
      console.error("Error copying form data:", error);
      showNotification("Error copying data. Please try again.");
    }
  }

  function clearFormData() {
    if (
      confirm(
        "Are you sure you want to reset all form data? This cannot be undone."
      )
    ) {
      formData = [];
      localStorage.removeItem("formData");
      renderFormElements();
      showNotification("All form data has been reset!");
    }
  }

  themeToggle.addEventListener("click", toggleTheme);
  showDataButton.addEventListener("click", showDataModal);
  clearDataButton.addEventListener("click", clearFormData);
  copyDataButton.addEventListener("click", copyDataToClipboard);
  closeDataButton.addEventListener("click", closeDataModal);
  closeDataModalBtn.addEventListener("click", closeDataModal);

  toolButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const type = button.dataset.type;
      addFormElement(type);
    });
  });

  saveFormButton.addEventListener("click", saveForm);
  closeModal.addEventListener("click", closeEditModal);
  updateElementButton.addEventListener("click", updateElement);
  cancelEditButton.addEventListener("click", closeEditModal);

  window.addEventListener("click", (event) => {
    if (event.target === editModal) {
      closeEditModal();
    }
    if (event.target === dataModal) {
      closeDataModal();
    }
  });

  initTheme();
  loadSavedFormData();
});
