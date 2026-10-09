#include <iostream>
#include <string>
#include <vector>

using namespace std;

string toLower(string str) {
    for (char &c : str) {
        c = tolower(c);
    }
    return str;
}

int main(int argc, char** argv) {
    string events = (argc > 1) ? argv[1] : "";
    int pets = (argc > 2) ? atoi(argv[2]) : 0;
    int forceStage = (argc > 3) ? atoi(argv[3]) : -1;

    string lowerEvents = toLower(events);
    
    int stage = 0;
    if (lowerEvents.find("evacuation") != string::npos) {
        stage = 3;
    } else if (lowerEvents.find("red flag") != string::npos) {
        stage = 2;
    } else if (lowerEvents.find("fire weather watch") != string::npos) {
        stage = 1;
    }

    if (forceStage >= 0 && forceStage <= 3) {
        stage = forceStage;
    }

    vector<string> actions;
    if (stage == 1) {
        actions = {
            "Charge phones and power banks.",
            "Check your go-bag and fill your gas tank.",
            "Pick two ways out of your area."
        };
    } else if (stage == 2) {
        actions = {
            "Close all home vents and windows.",
            "Park vehicles facing outward for a quick exit.",
            "Charge backup power banks."
        };
    } else if (stage == 3) {
        actions = {
            "Leave now. Follow instructions from local officials.",
            "Take your go-bag, medications, and documents.",
            "Do not go back for belongings."
        };
    }

    if (stage > 0 && pets > 0) {
        actions.push_back("Put pet carriers, leashes, and food by the door.");
    }

    cout << "{\"stage\":" << stage << ",\"actions\":[";
    for (size_t i = 0; i < actions.size(); ++i) {
        cout << "\"" << actions[i] << "\"" << (i + 1 < actions.size() ? "," : "");
    }
    cout << "]}\n";

    return 0;
}