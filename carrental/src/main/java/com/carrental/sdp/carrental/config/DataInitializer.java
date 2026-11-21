package com.carrental.sdp.carrental.config;

import com.carrental.sdp.carrental.model.Car;
import com.carrental.sdp.carrental.model.Role;
import com.carrental.sdp.carrental.model.User;
import com.carrental.sdp.carrental.repository.CarRepository;
import com.carrental.sdp.carrental.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Seeds the users and cars tables on startup.
 *
 * Each table is seeded only when it is EMPTY, so restarting the app never creates duplicates
 * and never brings back a user/car that an admin deliberately deleted. Bookings, payments,
 * reviews and reset tokens are intentionally not seeded: they come from real user actions
 * (payments must go through Razorpay).
 *
 * Disable with app.seed.enabled=false. Override the default passwords with
 * app.seed.admin-password / app.seed.user-password.
 */
@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.seed.enabled", havingValue = "true", matchIfMissing = true)
public class DataInitializer implements ApplicationRunner {

    private final UserRepository userRepository;
    private final CarRepository carRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.seed.admin-password:Admin@123}")
    private String adminPassword;

    @Value("${app.seed.user-password:User@123}")
    private String userPassword;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        seedUsers();
        seedCars();
    }

    private void seedUsers() {
        if (userRepository.count() > 0) {
            log.info("Seed: users table not empty, skipping user seed.");
            return;
        }
        List<User> users = List.of(
                user("Rentify Admin", "2300040118cseh@gmail.com", adminPassword, Role.ADMIN),
                user("Shyamsundar Bezawada", "shyamsundarbezawada5@gmail.com", userPassword, Role.CUSTOMER),
                user("KLU Student", "2300040118@kluniversity.in", userPassword, Role.CUSTOMER),
                user("Test Customer", "2300040118cseelge@gmail.com", userPassword, Role.CUSTOMER)
        );
        userRepository.saveAll(users);
        log.info("Seed: created {} users (1 admin, {} customers).", users.size(), users.size() - 1);
    }

    private void seedCars() {
        if (carRepository.count() > 0) {
            log.info("Seed: cars table not empty, skipping car seed.");
            return;
        }
        List<Car> cars = List.of(
                car("Maruti Suzuki", "Swift", "Hatchback", 1200, "N/A",
                        "https://res.cloudinary.com/daycg2a84/image/upload/v1746814263/z58fnb2nuvx6z8a0jxjw.webp"),
                car("Tata", "Nexon", "SUV", 1800, "A stylish and safe compact SUV.",
                        "https://res.cloudinary.com/daycg2a84/image/upload/v1746814304/lezxql95f2c92zjwqa6j.webp"),
                car("Mahindra", "Thar", "SUV", 2500, "A rugged off-road SUV for adventure seekers.",
                        "https://res.cloudinary.com/daycg2a84/image/upload/v1746814330/x8nsewo8ippfesaop1y4.avif"),
                car("Maruti Suzuki", "Ertiga", "MUV", 1500, "A very Spacious and Comfortable Car",
                        "https://res.cloudinary.com/daycg2a84/image/upload/v1746913096/hqupkzbhghobjumk9dts.png"),
                car("Mahindra", "XUV700", "SUV", 3000, "A Heavy Duty 7-Seater Car.",
                        "https://res.cloudinary.com/daycg2a84/image/upload/v1747060611/li2seimkrvoxsuscemib.webp"),
                car("Maruti Suzuki", "Baleno", "Hatchback", 2000, "Compact Car.",
                        "https://res.cloudinary.com/daycg2a84/image/upload/v1748177410/nu6xvxvt7vcvfwhu4zw7.jpg")
        );
        carRepository.saveAll(cars);
        log.info("Seed: created {} cars.", cars.size());
    }

    private User user(String name, String email, String rawPassword, Role role) {
        return User.builder()
                .name(name)
                .email(email)
                .password(passwordEncoder.encode(rawPassword))
                .role(role)
                .enabled(true)
                .build();
    }

    private static Car car(String brand, String model, String type, double pricePerDay,
                           String description, String imageUrl) {
        Car car = new Car();
        car.setBrand(brand);
        car.setModel(model);
        car.setType(type);
        car.setPricePerDay(pricePerDay);
        car.setAvailable(true);
        car.setDescription(description);
        car.setImageUrl(imageUrl);
        return car;
    }
}
