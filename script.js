 document.addEventListener("DOMContentLoaded", () => {
        const elements = {
          newSubjectName: document.getElementById("newSubjectName"),
          newAttended: document.getElementById("newAttended"),
          newTotal: document.getElementById("newTotal"),
          addSubjectBtn: document.getElementById("addSubjectBtn"),
          subjectsList: document.getElementById("subjectsList"),
          saveDataBtn: document.getElementById("saveDataBtn"),
          loadDataBtn: document.getElementById("loadDataBtn"),
          clearDataBtn: document.getElementById("clearDataBtn"),
          noSubjectsMessage: document.getElementById("noSubjectsMessage"),
          alertContainer: document.getElementById("alertContainer"),
        };

        let subjects = [];

        const saveData = () => {
          localStorage.setItem(
            "attendanceTrackerData",
            JSON.stringify(subjects)
          );
          alertMessage("Data saved successfully!", "green");
        };

        const loadData = () => {
          const savedData = localStorage.getItem("attendanceTrackerData");
          if (savedData) {
            subjects = JSON.parse(savedData);

            subjects.forEach((subject) => {
              subject.lastUpdated = subject.lastUpdated || getCurrentDate();
              subject.percentage = calculatePercentage(
                subject.attended,
                subject.total
              );
            });
            renderSubjects();
            alertMessage("Data loaded successfully!", "blue");
          } else {
            alertMessage("No saved data found.", "orange");
          }
        };

        const clearData = () => {
          showConfirmation(
            "Are you sure you want to clear all attendance data? This action cannot be undone.",
            () => {
              localStorage.removeItem("attendanceTrackerData");
              subjects = [];
              renderSubjects();
              alertMessage("All data cleared.", "red");
            }
          );
        };

        const calculatePercentage = (attended, total) => {
          return total === 0 ? "N/A" : ((attended / total) * 100).toFixed(2);
        };

        const getCurrentDate = () => {
          return new Date().toLocaleDateString();
        };

        const alertMessage = (message, type = "info") => {
          const alertDiv = document.createElement("div");
          alertDiv.className = `custom-alert text-white z-50`;

          const bgColorMap = {
            green: "bg-green-600",
            blue: "bg-blue-600",
            red: "bg-red-600",
            orange: "bg-orange-500",
            info: "bg-gray-700",
          };
          alertDiv.classList.add(bgColorMap[type] || bgColorMap.info);
          alertDiv.textContent = message;

          elements.alertContainer.appendChild(alertDiv);

          setTimeout(() => {
            alertDiv.style.opacity = "1";
            alertDiv.style.transform = "translateX(0)";
          }, 10);

          setTimeout(() => {
            alertDiv.style.opacity = "0";
            alertDiv.style.transform = "translateX(120%)";
            alertDiv.addEventListener(
              "transitionend",
              () => alertDiv.remove(),
              { once: true }
            );
          }, 3000);
        };

        const showConfirmation = (message, onConfirm) => {
          const modalId = "confirmModal";
          let modal = document.getElementById(modalId);

          if (modal) modal.remove();

          modal = document.createElement("div");
          modal.id = modalId;
          modal.className = `confirm-modal-overlay`;
          modal.innerHTML = `
                    <div class="confirm-modal-content">
                        <p>${message}</p>
                        <div class="confirm-modal-buttons">
                            <button id="confirmYes" class="btn-primary px-6 py-2">Yes</button>
                            <button id="confirmNo" class="btn-secondary px-6 py-2">No</button>
                        </div>
                    </div>
                `;
          document.body.appendChild(modal);

          setTimeout(() => {
            modal.style.opacity = "1";
            modal.querySelector(".confirm-modal-content").style.transform =
              "scale(1)";
          }, 10);

          const closeModal = () => {
            modal.style.opacity = "0";
            modal.querySelector(".confirm-modal-content").style.transform =
              "scale(0.95)";
            modal.addEventListener("transitionend", () => modal.remove(), {
              once: true,
            });
          };

          document
            .getElementById("confirmYes")
            .addEventListener("click", () => {
              onConfirm();
              closeModal();
            });
          document
            .getElementById("confirmNo")
            .addEventListener("click", closeModal);
          modal.addEventListener("click", (e) => {
            if (e.target === modal) closeModal();
          });
        };

        const renderSubjects = () => {
          elements.subjectsList.innerHTML = "";
          if (subjects.length === 0) {
            elements.noSubjectsMessage.style.display = "block";
          } else {
            elements.noSubjectsMessage.style.display = "none";
            subjects.forEach((subject, index) => {
              const subjectItem = document.createElement("div");
              subjectItem.className = "subject-item";

              const percentageValue = parseFloat(subject.percentage);
              const percentageDisplay = isNaN(percentageValue)
                ? "N/A"
                : percentageValue.toFixed(2) + "%";
              const percentageColorClass =
                percentageValue >= 75 ? "text-green-600" : "text-red-600";

              subjectItem.innerHTML = `
                            <div class="subject-info">
                                <input type="text" value="${
                                  subject.name
                                }" data-index="${index}" data-field="name">
                                <div class="class-inputs">
                                    <input type="number" value="${
                                      subject.attended
                                    }" data-index="${index}" data-field="attended">
                                    <input type="number" value="${
                                      subject.total
                                    }" data-index="${index}" data-field="total">
                                </div>
                                <span class="last-updated-date">Last Updated: ${
                                  subject.lastUpdated || "N/A"
                                }</span>
                            </div>
                            <span class="attendance-percentage ${percentageColorClass}">
                                ${percentageDisplay}
                            </span>
                            <button class="remove-subject-btn">Remove</button>
                        `;
              elements.subjectsList.appendChild(subjectItem);
            });
          }
        };

        elements.addSubjectBtn.addEventListener("click", () => {
          const name = elements.newSubjectName.value.trim();
          const attended = parseInt(elements.newAttended.value, 10);
          const total = parseInt(elements.newTotal.value, 10);

          if (
            !name ||
            isNaN(attended) ||
            isNaN(total) ||
            attended < 0 ||
            total < 0 ||
            attended > total
          ) {
            alertMessage(
              "Please enter valid data: Subject Name, Attended (>=0), Total (>=0), and Attended <= Total.",
              "red"
            );
            return;
          }

          subjects.push({
            name,
            attended,
            total,
            percentage: calculatePercentage(attended, total),
            lastUpdated: getCurrentDate(),
          });

          elements.newSubjectName.value = "";
          elements.newAttended.value = "";
          elements.newTotal.value = "";

          renderSubjects();
          saveData();
        });

        elements.subjectsList.addEventListener("input", (event) => {
          const target = event.target;
          const { index, field } = target.dataset;

          if (index === undefined || !field) return;

          let value = target.value;
          let shouldUpdateDate = false;

          if (field === "attended" || field === "total") {
            value = parseInt(value, 10);
            if (isNaN(value) || value < 0) {
              alertMessage("Please enter a valid non-negative number.", "red");
              return;
            }
            if (subjects[index][field] !== value) shouldUpdateDate = true;
          } else if (field === "name") {
            if (subjects[index][field] !== value) shouldUpdateDate = true;
          }

          const tempAttended =
            field === "attended" ? value : subjects[index].attended;
          const tempTotal = field === "total" ? value : subjects[index].total;
          if (
            !isNaN(tempAttended) &&
            !isNaN(tempTotal) &&
            tempAttended > tempTotal
          ) {
            alertMessage(
              "Attended classes cannot be more than total classes.",
              "red"
            );
            return;
          }

          subjects[index][field] = value;

          if (field === "attended" || field === "total") {
            subjects[index].percentage = calculatePercentage(
              subjects[index].attended,
              subjects[index].total
            );
            const percentageSpan = target
              .closest(".subject-item")
              .querySelector(".attendance-percentage");
            const percentageValue = parseFloat(subjects[index].percentage);
            percentageSpan.textContent = isNaN(percentageValue)
              ? "N/A"
              : percentageValue.toFixed(2) + "%";

            percentageSpan.classList.toggle(
              "text-green-600",
              percentageValue >= 75
            );
            percentageSpan.classList.toggle(
              "text-red-600",
              percentageValue < 75
            );
          }

          if (shouldUpdateDate) {
            subjects[index].lastUpdated = getCurrentDate();
            target
              .closest(".subject-item")
              .querySelector(
                ".last-updated-date"
              ).textContent = `Last Updated: ${subjects[index].lastUpdated}`;
          }

          saveData();
        });

        elements.subjectsList.addEventListener("click", (event) => {
          if (event.target.classList.contains("remove-subject-btn")) {
            const subjectItem = event.target.closest(".subject-item");
            const index = subjectItem.querySelector('input[data-field="name"]')
              .dataset.index;

            showConfirmation(
              `Are you sure you want to remove "${subjects[index].name}"?`,
              () => {
                subjects.splice(index, 1);
                renderSubjects();
                saveData();
              }
            );
          }
        });

        elements.saveDataBtn.addEventListener("click", saveData);
        elements.loadDataBtn.addEventListener("click", loadData);
        elements.clearDataBtn.addEventListener("click", clearData);

        loadData();
      });