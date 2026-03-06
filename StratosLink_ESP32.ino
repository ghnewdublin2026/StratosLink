#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <SparkFun_u-blox_GNSS_Arduino_Library.h> 

SFE_UBLOX_GNSS myGNSS;
BLECharacteristic *pCharacteristic;

void setup() {
  Serial.begin(115200);
  Wire.begin();
  
  if (myGNSS.begin() == false) {
    Serial.println("u-blox GNSS not detected.");
    while (1);
  }

  BLEDevice::init("Precision-GPS-Rover");
  BLEServer *pServer = BLEDevice::createServer();
  BLEService *pService = pServer->createService("181a");
  pCharacteristic = pService->createCharacteristic("2a67", BLECharacteristic::PROPERTY_NOTIFY);
  pService->start();
  pServer->getAdvertising()->start();
}

void loop() {
  // Get high-precision data from u-blox
  float lat = myGNSS.getLatitude() / 10000000.0;
  float lon = myGNSS.getLongitude() / 10000000.0;
  float acc = myGNSS.getHorizontalAccuracy() / 1000.0; // Convert mm to meters

  float data[3] = {lat, lon, acc};
  pCharacteristic->setValue((uint8_t*)data, 12);
  pCharacteristic->notify();
  
  delay(100); // 10Hz Update rate
}

