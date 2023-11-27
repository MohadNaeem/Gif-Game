import React, { useEffect, useState } from "react";
// import { FaFlag } from 'react-icons/fa'; // Import your flag icons
import { CircleFlag } from "react-circle-flags";
function CustomFlagSelect() {
  const [showFlags, setShowFlags] = useState(false);
  const [selectedFlag, setSelectedFlag] = useState(null);

  const EnglishFlag = () => (
    <CircleFlag countryCode="us" height="50" width="50" />
  );
  const SpanishFlag = () => (
    <CircleFlag countryCode="es" height="50" width="50" />
  );
  const ArabicFlag = () => (
    <CircleFlag countryCode="ar" height="50" width="50" />
  );
  const FrenchFlag = () => (
    <CircleFlag countryCode="fr" height="50" width="50" />
  );
  const ChienseFlag = () => (
    <CircleFlag countryCode="zh" height="50" width="50" />
  );
  const ThaiFlag = () => <CircleFlag countryCode="ar" height="50" width="50" />;
  const Hindilag = () => <CircleFlag countryCode="in" height="50" width="50" />;
  const TurkyFlag = () => (
    <CircleFlag countryCode="tr" height="50" width="50" />
  );
  const flags = [
    { id: "us", name: "United States", icon: <EnglishFlag /> },
    { id: "es", name: "Spain", icon: <SpanishFlag /> },
    { id: "ar", name: "Arabic", icon: <ArabicFlag /> },
    { id: "zh", name: "Chiense", icon: <ChienseFlag /> },
    // { id: 'fr', name: 'Français', icon: <FrenchFlag /> },
    { id: "th", name: "Thai", icon: <ThaiFlag /> },
    { id: "hi", name: "Hindi", icon: <Hindilag /> },
    { id: "tr", name: "Turkish", icon: <TurkyFlag /> },
    // Add more flags here...
  ];

  const toggleFlags = () => {
    setShowFlags(!showFlags);
  };

  const handleFlagClick = (flag) => {
    setSelectedFlag(flag);
    localStorage.setItem("flag", JSON.stringify(flag.id));
    window.location.reload();
    toggleFlags();
  };

  useEffect(() => {
    const language = JSON.parse(localStorage.getItem("flag")) || "en";
    const flag = flags.find((flag) => flag.id == language);
    setSelectedFlag(flag);
    console.log("inside flag", flag);
  }, []);

  return (
    <div className="custom-flag-select">
      <button className="toggle-button" onClick={toggleFlags}>
        {selectedFlag ? (
          selectedFlag.icon
        ) : (
          <button class="circular-button"></button>
        )}
      </button>
      {showFlags && (
        <div
          style={{ position: "absolute", left: "-130px", top: "-190px" }}
          className="flags-container"
        >
          {flags.map((flag) => (
            <div
              key={flag.id}
              className="flag-card"
              onClick={() => handleFlagClick(flag)}
            >
              {flag.icon} <span className="flag-name">{flag.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CustomFlagSelect;
