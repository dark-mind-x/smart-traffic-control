#include <WiFi.h>
#include <Firebase_ESP_Client.h>

// Provide the token generation process info
#include "addons/TokenHelper.h"
#include "addons/RTDBHelper.h"

// ---------------- Credentials ----------------
#define WIFI_SSID "TrafficControlWiFi"
#define WIFI_PASSWORD "traffic1234"

#define API_KEY "AIzaSyDnxolDMt6S8wvXQ3EMxV9hQQSZOkwS-iM"
#define DATABASE_URL "https://smart-traffic-system-2a0ed-default-rtdb.firebaseio.com"
#define USER_EMAIL "alranfal@gmail.com"
#define USER_PASSWORD "12345678"

// ---------------- Firebase Objects ----------------
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;
bool signupOK = false;

// ---------------- Pin Definitions ----------------
// Road 1 (North)
const int trig1 = 16, echo1 = 21, sound1 = 34;
const int R1 = 32, Y1 = 33, G1 = 25;

// Road 2 (East)
const int trig2 = 17, echo2 = 22, sound2 = 35;
const int R2 = 26, Y2 = 27, G2 = 14;

// Road 3 (South)
const int trig3 = 18, echo3 = 23, sound3 = 36;
const int R3 = 12, Y3 = 13, G3 = 15;

// Road 4 (West)
const int trig4 = 19, echo4 = 5, sound4 = 39;
const int R4 = 2, Y4 = 4, G4 = 0;

// ---------------- Timing Variables ----------------
unsigned long previousMillis = 0;
int currentRoad = 1;      // Which road is currently green
int trafficState = 0;     // 0 = Green, 1 = Yellow
int greenDuration = 5000; // Default 5 seconds (will change based on density)
const int yellowDuration = 2000; 

// Emergency Variables
bool emergencyActive = false;
int emergencyRoad = 0;

void setup() {
  Serial.begin(115200);
  
  // Set Pin Modes
  pinMode(trig1, OUTPUT); pinMode(echo1, INPUT); pinMode(sound1, INPUT);
  pinMode(trig2, OUTPUT); pinMode(echo2, INPUT); pinMode(sound2, INPUT);
  pinMode(trig3, OUTPUT); pinMode(echo3, INPUT); pinMode(sound3, INPUT);
  pinMode(trig4, OUTPUT); pinMode(echo4, INPUT); pinMode(sound4, INPUT);
  
  pinMode(R1, OUTPUT); pinMode(Y1, OUTPUT); pinMode(G1, OUTPUT);
  pinMode(R2, OUTPUT); pinMode(Y2, OUTPUT); pinMode(G2, OUTPUT);
  pinMode(R3, OUTPUT); pinMode(Y3, OUTPUT); pinMode(G3, OUTPUT);
  pinMode(R4, OUTPUT); pinMode(Y4, OUTPUT); pinMode(G4, OUTPUT);

  // Default all to Red
  setAllRed();

  // Connect to Wi-Fi
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(300);
  }
  Serial.println("\nConnected!");

  // Assign the API key, URL, and User Auth
  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;
  auth.user.email = USER_EMAIL;
  auth.user.password = USER_PASSWORD;
  config.token_status_callback = tokenStatusCallback; 

  // Initialize Firebase
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);
}

void loop() {
  // 1. Check for Emergencies FIRST (Overrides everything)
  checkEmergencies();

  if (emergencyActive) {
    // If emergency, lock the lights and update Firebase
    handleEmergency();
  } else {
    // 2. Normal Traffic Cycle Management (Non-blocking)
    manageTrafficLights();
  }
}

// ---------------- Function: Traffic Light Cycle ----------------
void manageTrafficLights() {
  unsigned long currentMillis = millis();
  int currentDuration = (trafficState == 0) ? greenDuration : yellowDuration;

  if (currentMillis - previousMillis >= currentDuration) {
    previousMillis = currentMillis;

    if (trafficState == 0) {
      // Switch from Green to Yellow
      trafficState = 1;
      setYellow(currentRoad);
    } else {
      // Switch from Yellow to next road's Green
      trafficState = 0;
      currentRoad++;
      if (currentRoad > 4) currentRoad = 1; // Loop back to Road 1

      // Before turning green, check the traffic density to decide duration!
      String intensity = checkDensity(currentRoad);
      greenDuration = (intensity == "high") ? 10000 : 5000; // 10s for high, 5s for low

      setGreen(currentRoad);
      
      // Update Firebase with new colors and intensity
      updateFirebase(currentRoad, intensity);
    }
  }
}

// ---------------- Function: Ultrasonic Logic ----------------
String checkDensity(int road) {
  int trig, echo;
  if (road == 1) { trig = trig1; echo = echo1; }
  else if (road == 2) { trig = trig2; echo = echo2; }
  else if (road == 3) { trig = trig3; echo = echo3; }
  else { trig = trig4; echo = echo4; }

  // Send ping
  digitalWrite(trig, LOW); delayMicroseconds(2);
  digitalWrite(trig, HIGH); delayMicroseconds(10);
  digitalWrite(trig, LOW);
  
  long duration = pulseIn(echo, HIGH, 30000); // 30ms timeout
  int distance = duration * 0.034 / 2;

  // Assume car is present if distance is less than 10cm (adjust for your model!)
  if (distance > 0 && distance < 10) return "high"; 
  return "low";
}

// ---------------- Function: Emergency Sound Logic ----------------
void checkEmergencies() {
  // Read digital signal from sound sensors. (1 = Siren detected)
  if (digitalRead(sound1) == HIGH) { emergencyActive = true; emergencyRoad = 1; }
  else if (digitalRead(sound2) == HIGH) { emergencyActive = true; emergencyRoad = 2; }
  else if (digitalRead(sound3) == HIGH) { emergencyActive = true; emergencyRoad = 3; }
  else if (digitalRead(sound4) == HIGH) { emergencyActive = true; emergencyRoad = 4; }
  
  // If the sirens stop, resume normal traffic
  if (digitalRead(sound1) == LOW && digitalRead(sound2) == LOW && 
      digitalRead(sound3) == LOW && digitalRead(sound4) == LOW) {
    if (emergencyActive) {
      emergencyActive = false;
      // Tell React the emergency is over
      Firebase.RTDB.setBool(&fbdo, "junction1/emergency/active", false);
      setGreen(currentRoad); // Resume normal lights
    }
  }
}

void handleEmergency() {
  setAllRed(); // Make everyone stop
  
  // Give the emergency road a green light
  if (emergencyRoad == 1) { digitalWrite(R1, LOW); digitalWrite(G1, HIGH); }
  if (emergencyRoad == 2) { digitalWrite(R2, LOW); digitalWrite(G2, HIGH); }
  if (emergencyRoad == 3) { digitalWrite(R3, LOW); digitalWrite(G3, HIGH); }
  if (emergencyRoad == 4) { digitalWrite(R4, LOW); digitalWrite(G4, HIGH); }

  // Push emergency alert to Firebase so React banner drops down
  String roadName = "Road " + String(emergencyRoad);
  Firebase.RTDB.setBool(&fbdo, "junction1/emergency/active", true);
  Firebase.RTDB.setString(&fbdo, "junction1/emergency/road", roadName);
}

// ---------------- LED Helper Functions ----------------
void setAllRed() {
  digitalWrite(R1, HIGH); digitalWrite(Y1, LOW); digitalWrite(G1, LOW);
  digitalWrite(R2, HIGH); digitalWrite(Y2, LOW); digitalWrite(G2, LOW);
  digitalWrite(R3, HIGH); digitalWrite(Y3, LOW); digitalWrite(G3, LOW);
  digitalWrite(R4, HIGH); digitalWrite(Y4, LOW); digitalWrite(G4, LOW);
}

void setGreen(int road) {
  setAllRed();
  if (road == 1) { digitalWrite(R1, LOW); digitalWrite(G1, HIGH); }
  if (road == 2) { digitalWrite(R2, LOW); digitalWrite(G2, HIGH); }
  if (road == 3) { digitalWrite(R3, LOW); digitalWrite(G3, HIGH); }
  if (road == 4) { digitalWrite(R4, LOW); digitalWrite(G4, HIGH); }
}

void setYellow(int road) {
  setAllRed();
  if (road == 1) { digitalWrite(R1, LOW); digitalWrite(Y1, HIGH); }
  if (road == 2) { digitalWrite(R2, LOW); digitalWrite(Y2, HIGH); }
  if (road == 3) { digitalWrite(R3, LOW); digitalWrite(Y3, HIGH); }
  if (road == 4) { digitalWrite(R4, LOW); digitalWrite(Y4, HIGH); }
}

// ---------------- Firebase Sync Function ----------------
void updateFirebase(int greenRoad, String intensity) {
  // Build a fast JSON object to push all updates at once
  FirebaseJson json;
  
  for (int i = 1; i <= 4; i++) {
    String roadPath = "road" + String(i);
    String color = (i == greenRoad) ? "green" : "red";
    // For simplicity, we just log the intensity of the road that just turned green
    String roadIntensity = (i == greenRoad) ? intensity : "low"; 
    
    json.set(roadPath + "/color", color);
    json.set(roadPath + "/intensity", roadIntensity);
  }
  
  // Push the entire updated junction state to the cloud
  Firebase.RTDB.updateNode(&fbdo, "junction1", &json);
}